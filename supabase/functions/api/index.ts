import { Hono } from 'npm:hono@4';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { uuidv7 } from 'npm:uuidv7@0.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const app = new Hono();

app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  await next();
  for (const [key, value] of Object.entries(corsHeaders)) {
    c.res.headers.set(key, value);
  }
});

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

function classifyAge(age: number): string {
  if (age <= 12) return 'child';
  if (age <= 19) return 'teenager';
  if (age <= 59) return 'adult';
  return 'senior';
}

app.post('/api/profiles', async (c) => {
  try {
    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ status: 'error', message: 'Invalid JSON body' }, 400);
    }

    if (!('name' in body) || body.name === null || body.name === undefined || body.name === '') {
      return c.json({ status: 'error', message: 'Missing or empty name' }, 400);
    }

    if (typeof body.name !== 'string') {
      return c.json({ status: 'error', message: 'Invalid type' }, 422);
    }

    const name = body.name.trim().toLowerCase();

    if (!name) {
      return c.json({ status: 'error', message: 'Missing or empty name' }, 400);
    }

    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      return c.json({ status: 'success', message: 'Profile already exists', data: existing }, 200);
    }

    const [genderizeRes, agifyRes, nationalizeRes] = await Promise.all([
      fetch(`https://api.genderize.io?name=${encodeURIComponent(name)}`),
      fetch(`https://api.agify.io?name=${encodeURIComponent(name)}`),
      fetch(`https://api.nationalize.io?name=${encodeURIComponent(name)}`),
    ]);

    const [genderizeData, agifyData, nationalizeData] = await Promise.all([
      genderizeRes.json(),
      agifyRes.json(),
      nationalizeRes.json(),
    ]);

    if (!genderizeData.gender || genderizeData.count === 0 || genderizeData.count === null) {
      return c.json({ status: '502', message: 'Genderize returned an invalid response' }, 502);
    }

    if (agifyData.age === null || agifyData.age === undefined) {
      return c.json({ status: '502', message: 'Agify returned an invalid response' }, 502);
    }

    if (!nationalizeData.country || nationalizeData.country.length === 0) {
      return c.json({ status: '502', message: 'Nationalize returned an invalid response' }, 502);
    }

    const topCountry = nationalizeData.country.reduce(
      (max: { country_id: string; probability: number }, curr: { country_id: string; probability: number }) =>
        curr.probability > max.probability ? curr : max,
      nationalizeData.country[0],
    );

    const now = new Date().toISOString();
    const profile = {
      id: uuidv7(),
      name,
      gender: genderizeData.gender,
      gender_probability: genderizeData.probability,
      sample_size: genderizeData.count,
      age: agifyData.age,
      age_group: classifyAge(agifyData.age),
      country_id: topCountry.country_id,
      country_probability: topCountry.probability,
      created_at: now,
    };

    const { data, error } = await supabase.from('profiles').insert(profile).select().single();

    if (error) {
      return c.json({ status: 'error', message: error.message }, 500);
    }

    return c.json({ status: 'success', data }, 201);
  } catch (e) {
    return c.json({ status: 'error', message: 'Internal server error' }, 500);
  }
});

app.get('/api/profiles', async (c) => {
  try {
    const supabase = getSupabase();

    let query = supabase
      .from('profiles')
      .select('id, name, gender, age, age_group, country_id');

    const gender = c.req.query('gender');
    const country_id = c.req.query('country_id');
    const age_group = c.req.query('age_group');

    if (gender) query = query.ilike('gender', gender);
    if (country_id) query = query.ilike('country_id', country_id);
    if (age_group) query = query.ilike('age_group', age_group);

    const { data, error } = await query;

    if (error) {
      return c.json({ status: 'error', message: error.message }, 500);
    }

    return c.json({ status: 'success', count: data.length, data }, 200);
  } catch (e) {
    return c.json({ status: 'error', message: 'Internal server error' }, 500);
  }
});

app.get('/api/profiles/:id', async (c) => {
  try {
    const supabase = getSupabase();
    const id = c.req.param('id');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return c.json({ status: 'error', message: error.message }, 500);
    }

    if (!data) {
      return c.json({ status: 'error', message: 'Profile not found' }, 404);
    }

    return c.json({ status: 'success', data }, 200);
  } catch (e) {
    return c.json({ status: 'error', message: 'Internal server error' }, 500);
  }
});

app.delete('/api/profiles/:id', async (c) => {
  try {
    const supabase = getSupabase();
    const id = c.req.param('id');

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return c.json({ status: 'error', message: 'Profile not found' }, 404);
    }

    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      return c.json({ status: 'error', message: error.message }, 500);
    }

    return c.text('', 204);
  } catch (e) {
    return c.json({ status: 'error', message: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);
