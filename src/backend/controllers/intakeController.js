// controllers/intakeController.js
const knex = require('../db/knex');
const { generatePatientReport } = require('../../utils/reportGenerator');

exports.submitIntake = async (req, res) => {
  const { user_id, form_data, gender } = req.body;

  if (!user_id || !form_data || !gender) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { report, labRecommendations } = generatePatientReport(form_data, gender);
    const [{ email }] = await knex('users')
      .select(knex.raw('pgp_sym_decrypt(email::bytea, ?) AS email', [process.env.PGPCRYPTO_KEY]))
      .where({ id: user_id, is_deleted: false })
      .limit(1);

    if (!email) {
      return res.status(404).json({ error: 'User email not found' });
    }
    const encryptedEmail = knex.raw('pgp_sym_encrypt(?, ?)', [email, process.env.PGPCRYPTO_KEY]);

    const [saved] = await knex('intake_reports')
      .insert({
        user_id,
        form_data,
        user_email: encryptedEmail,
        report_output: { report, labRecommendations },
        submitted_at: new Date().toISOString() 
      })
      .returning('*');

    res.json({ success: true, saved });
  } catch (err) {
    console.error('❌ Intake submission failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMyReports = async (req, res) => {
  const userId = req.user.id;

  try {
    const reports = await knex('intake_reports')
      .select(
        'id',
        knex.raw('pgp_sym_decrypt(user_email::bytea, ?) AS user_email', [process.env.PGPCRYPTO_KEY]),
        'form_data',
        'report_output',
        'submitted_at'
      )
      .where({ user_id: userId })
      .orderBy('submitted_at', 'desc');

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};