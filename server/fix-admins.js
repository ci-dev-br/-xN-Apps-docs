const { Client } = require('pg');

const client = new Client({
  host: '::1',
  port: 5432,
  user: 'postgres',
  password: '485916273565123',
  database: 'br.dev.ci.services'
});

async function run() {
  await client.connect();
  const u1 = await client.query('UPDATE grupo SET admin_id = created_by WHERE admin_id IS NULL AND created_by IS NOT NULL');
  console.log('Updated grupo admin_id rows:', u1.rowCount);

  const groups = await client.query('SELECT id, admin_id, tenant_id FROM grupo WHERE admin_id IS NOT NULL');
  for (const g of groups.rows) {
    const existing = await client.query('SELECT id FROM grupo_membership WHERE grupo_id = $1 AND user_id = $2', [g.id, g.admin_id]);
    if (existing.rows.length === 0) {
      await client.query("INSERT INTO grupo_membership (grupo_id, user_id, role, status, requested_at, approved_at) VALUES ($1, $2, 'ADMIN', 'APPROVED', now(), now())", [g.id, g.admin_id]);
    } else {
      await client.query("UPDATE grupo_membership SET role = 'ADMIN', status = 'APPROVED', approved_at = now() WHERE grupo_id = $1 AND user_id = $2", [g.id, g.admin_id]);
    }

    try {
      await client.query('INSERT INTO user_tenants_tenant ("userId", "tenantId") VALUES ($1, $2) ON CONFLICT DO NOTHING', [g.admin_id, g.tenant_id]);
    } catch (e) {
      // Ignora se relação já existir
    }
  }

  const res = await client.query("SELECT g.name, gm.role, gm.status, gm.user_id FROM grupo g JOIN grupo_membership gm ON gm.grupo_id = g.id WHERE gm.status = 'APPROVED'");
  console.log('Grupos com membership APPROVED:', res.rows.length);
  console.log(res.rows);

  await client.end();
}

run().catch(console.error);
