import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { google } from 'googleapis'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin')
    return NextResponse.json({ error: 'Prohibido' }, { status: 403 })

  const { id } = params

  // Obtener candidato
  const { data: candidate, error: fetchError } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !candidate) {
    return NextResponse.json({ error: 'Candidato no encontrado' }, { status: 404 })
  }

  // Actualizar estado en base de datos
  const { error: updateError } = await supabase
    .from('candidates')
    .update({ estado_contacto: 'Contactado' })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }

  // Actualizar Google Sheets (buscando la fila por local y nombre completo)
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n')
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    )
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = process.env.GOOGLE_SHEET_ID!
    const range = 'A:J' // columnas A a J
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range })
    const rows = res.data.values
    if (rows) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        // Índices: 0 Fecha, 1 Local, 2 Nombre y Apellido, 9 Estado
        if (
          row[1] === candidate.local_name &&
          row[2] === `${candidate.nombre} ${candidate.apellido}` &&
          row[9] === 'No contactado'
        ) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `J${i + 1}`, // Columna Estado (J)
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [['Contactado']] },
          })
          break
        }
      }
    }
  } catch (e) {
    console.error('Error actualizando Sheet:', e)
    // No detenemos la operación principal
  }

  return NextResponse.json({ success: true })
}
