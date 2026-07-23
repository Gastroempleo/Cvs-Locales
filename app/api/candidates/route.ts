import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'local')
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const localName = user.user_metadata?.local_name
  if (!localName)
    return NextResponse.json({ error: 'Usuario sin local asignado' }, { status: 400 })

  const formData = await request.formData()
  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const telefono = formData.get('telefono') as string
  const email = formData.get('email') as string
  const puesto = formData.get('puesto') as string
  const cargadoPor = formData.get('cargadoPor') as string
  const observaciones = formData.get('observaciones') as string
  const cvFile = formData.get('cv') as File

  if (!nombre || !apellido || !cargadoPor || !cvFile) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  try {
    // Google Auth
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n')
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/spreadsheets']
    )

    const drive = google.drive({ version: 'v3', auth })
    const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID!

    // Buscar o crear carpeta del local
    let folderId: string | null = null
    const folderRes = await drive.files.list({
      q: `name='${localName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
      spaces: 'drive',
    })
    if (folderRes.data.files && folderRes.data.files.length > 0) {
      folderId = folderRes.data.files[0].id!
    } else {
      const folder = await drive.files.create({
        requestBody: {
          name: localName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId],
        },
        fields: 'id',
      })
      folderId = folder.data.id!
    }

    // Subir archivo
    const buffer = Buffer.from(await cvFile.arrayBuffer())
    const fileMetadata = {
      name: `${nombre}_${apellido}_CV`,
      parents: [folderId],
    }
    const media = {
      mimeType: cvFile.type,
      body: Readable.from(buffer),
    }
    const driveFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    })
    const cvUrl = driveFile.data.webViewLink!

    // Escribir en Google Sheets
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = process.env.GOOGLE_SHEET_ID!
    const rowData = [
      new Date().toISOString(),
      localName,
      `${nombre} ${apellido}`,
      telefono,
      email,
      puesto,
      cargadoPor,
      observaciones,
      cvUrl,
      'No contactado',
    ]
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowData] },
    })

    // Guardar en Supabase
    const { error: dbError } = await supabase.from('candidates').insert({
      local_name: localName,
      nombre,
      apellido,
      telefono,
      email,
      puesto,
      cargado_por: cargadoPor,
      observaciones,
      cv_url: cvUrl,
      estado_contacto: 'No contactado',
      created_by: user.id,
    })

    if (dbError) {
      console.error('Error Supabase:', dbError)
      return NextResponse.json({ error: 'Error al guardar en base de datos' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error en POST /api/candidates:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
