const { createClient } = require('@libsql/client');
const crypto = require('crypto');
const fs = require('fs');

const client = createClient({
  url: 'libsql://dcep-dataleum.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg0NTc1NTAsImlkIjoiMDFhMDY4NWMtM2IwMS03ODNlLTkxMzUtNDAxY2YyZDJiN2JlIiwia2lkIjoiU3RDMmxacTU4bmUzVktaRzE1NHpTN3oyUnFLTkFSODVjWXR2SmlJUDA1dyIsInJpZCI6ImQ5Y2NkYjhjLWQ3NmYtNGJmYS1iMjAwLThmMzZlNGZkZjc1MCJ9.TqKmq5UIq0GsvcIWbJz4odzQ05QKNHh_Rb2XeHLuzInmEIWeDwoEbTLF5LjIp-wK7RZe8WjdHHAeNWnM_aurCw'
});

const EXAM_ID = 'd7603d69-445b-4e58-9f80-49cc3331e612'; // DP-600

async function run() {
  const data = JSON.parse(fs.readFileSync('case_studies.json', 'utf8'));
  
  for (const cs of data) {
    // Check if case study exists
    let csId;
    const existingCs = await client.execute({
      sql: 'SELECT id FROM CaseStudy WHERE title = ? AND exam_id = ?',
      args: [cs.title, EXAM_ID]
    });
    
    if (existingCs.rows.length > 0) {
       csId = existingCs.rows[0].id;
       console.log(`Case Study already exists: ${cs.title} (${csId})`);
    } else {
       csId = crypto.randomUUID();
       console.log(`Inserting Case Study: ${cs.title}`);
       await client.execute({
         sql: 'INSERT INTO CaseStudy (id, exam_id, title, content) VALUES (?, ?, ?, ?)',
         args: [csId, EXAM_ID, cs.title, cs.content]
       });
    }
    
    for (const q of cs.questions) {
      const prefix = q.question_text.substring(0, 40) + '%';
      const existing = await client.execute({
        sql: 'SELECT id FROM Question WHERE exam_id = ? AND question_text LIKE ?',
        args: [EXAM_ID, prefix]
      });
      
      if (existing.rows.length > 0) {
        const qId = existing.rows[0].id;
        console.log(`  Linking existing question: ${qId}`);
        await client.execute({
          sql: 'UPDATE Question SET case_study_id = ? WHERE id = ?',
          args: [csId, qId]
        });
      } else {
        const qId = crypto.randomUUID();
        console.log(`  Inserting NEW question: ${qId}`);
        await client.execute({
          sql: `INSERT INTO Question (id, exam_id, case_study_id, domain_topic, question_type, question_text, explanation, is_verified, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'Manual JSON')`,
          args: [qId, EXAM_ID, csId, q.domain_topic, q.question_type, q.question_text, q.explanation]
        });
        
        for (const opt of q.options) {
          await client.execute({
            sql: 'INSERT INTO Option (id, question_id, option_text, is_correct) VALUES (?, ?, ?, ?)',
            args: [crypto.randomUUID(), qId, opt.option_text, opt.is_correct ? 1 : 0]
          });
        }
      }
    }
  }
  console.log('Done!');
}

run().catch(console.error);
