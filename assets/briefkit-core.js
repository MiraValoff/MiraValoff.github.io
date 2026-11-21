/* Mira Val BriefKit — small dependency-free, no-network model. */
(function (host) {
  'use strict';
  const LIMITS = Object.freeze({ name: 90, email: 180, goal: 800, input: 280, output: 280, criteria: 700, timeline: 80 });
  const clean = (v, length) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, length) : '';
  function createBrief(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid brief input.');
    const x = {};
    for (const [key, length] of Object.entries(LIMITS)) x[key] = clean(raw[key], length);
    if (x.name.length < 2) throw new Error('Add a project name (at least two characters).');
    if (x.goal.length < 12) throw new Error('Describe the goal in at least 12 characters.');
    if (!x.input || !x.output) throw new Error('Specify both input and output.');
    if (x.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email)) throw new Error('Enter a valid contact email or leave it empty.');
    const sensitivity = ['Not sure', 'No personal data', 'May include personal data'].includes(raw.sensitivity) ? raw.sensitivity : 'Not sure';
    return Object.freeze({
      format: 'mira-val.briefkit.v1',
      project: x.name,
      contact_email: x.email || null,
      goal: x.goal,
      inputs: x.input,
      outputs: x.output,
      acceptance_criteria: x.criteria || 'To be defined with the client before implementation.',
      timeline: x.timeline || 'To be discussed',
      data_sensitivity: sensitivity,
      status: 'DRAFT — scope is not a quote, contract, or commitment',
    });
  }
  function toText(b) {
    return [`PROJECT BRIEF — ${b.project}`, 'Status: DRAFT / not a quote', '',
      `Goal: ${b.goal}`, `Input(s): ${b.inputs}`, `Expected output(s): ${b.outputs}`,
      `Acceptance criteria: ${b.acceptance_criteria}`, `Timeline: ${b.timeline}`,
      `Data sensitivity: ${b.data_sensitivity}`, `Contact: ${b.contact_email || 'Not provided'}`,
      '', 'Prepared with Mira Val BriefKit. This draft is for human review.'].join('\n');
  }
  function safeFilename(name) {
    const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
    return `${slug || 'project'}-brief.json`;
  }
  const api = { createBrief, toText, safeFilename, LIMITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else host.BriefKit = api;
})(typeof window !== 'undefined' ? window : globalThis);
