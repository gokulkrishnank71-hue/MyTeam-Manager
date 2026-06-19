const fs = require("fs");
const path = require("path");

const outDir = __dirname;

const tables = [
  {
    name: "User",
    color: "#2563eb",
    fields: [
      ["PK", "id"],
      ["UQ", "email"],
      ["--", "username"],
      ["--", "first_name"],
      ["--", "last_name"],
      ["--", "password"],
      ["--", "is_active"],
      ["--", "is_staff"],
      ["--", "date_joined"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "UserProfile",
    color: "#0f766e",
    fields: [
      ["PK", "id"],
      ["FK", "user_id -> User.id"],
      ["--", "avatar"],
      ["--", "phone"],
      ["--", "job_title"],
      ["--", "bio"],
      ["--", "location"],
      ["--", "social_handle"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "UserPreference",
    color: "#64748b",
    fields: [
      ["PK", "id"],
      ["FK", "user_id -> User.id"],
      ["--", "email_project_answers"],
      ["--", "email_mentions"],
      ["--", "new_launches"],
      ["--", "monthly_updates"],
      ["--", "newsletter"],
      ["--", "theme"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "Company",
    color: "#0891b2",
    fields: [
      ["PK", "id"],
      ["--", "name"],
      ["UQ", "slug"],
      ["--", "email"],
      ["--", "phone"],
      ["--", "website"],
      ["--", "address"],
      ["--", "timezone"],
      ["--", "date_format"],
      ["--", "language"],
      ["--", "logo"],
      ["FK", "created_by_id -> User.id"],
      ["--", "created_at"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "CompanyInvitation",
    color: "#d97706",
    fields: [
      ["PK", "id"],
      ["FK", "company_id -> Company.id"],
      ["FK", "team_id -> Team.id"],
      ["FK", "invited_by_id -> User.id"],
      ["--", "email"],
      ["--", "role"],
      ["--", "status"],
      ["UQ", "token"],
      ["--", "expires_at"],
      ["--", "accepted_at"],
      ["--", "created_at"],
    ],
  },
  {
    name: "CompanyMember",
    color: "#7c3aed",
    fields: [
      ["PK", "id"],
      ["FK", "company_id -> Company.id"],
      ["FK", "user_id -> User.id"],
      ["--", "role"],
      ["--", "status"],
      ["--", "joined_at"],
      ["UQ", "company_id + user_id"],
    ],
  },
  {
    name: "Team",
    color: "#059669",
    fields: [
      ["PK", "id"],
      ["FK", "company_id -> Company.id"],
      ["--", "name"],
      ["--", "description"],
      ["--", "department"],
      ["FK", "lead_id -> User.id"],
      ["FK", "created_by_id -> User.id"],
      ["--", "created_at"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "TeamMember",
    color: "#16a34a",
    fields: [
      ["PK", "id"],
      ["FK", "team_id -> Team.id"],
      ["FK", "user_id -> User.id"],
      ["--", "role"],
      ["--", "workload_percent"],
      ["--", "availability"],
      ["--", "joined_at"],
      ["UQ", "team_id + user_id"],
    ],
  },
  {
    name: "Project",
    color: "#ea580c",
    fields: [
      ["PK", "id"],
      ["FK", "team_id -> Team.id"],
      ["FK", "owner_id -> User.id"],
      ["FK", "created_by_id -> User.id"],
      ["--", "name"],
      ["--", "description"],
      ["--", "status"],
      ["--", "priority"],
      ["--", "progress_percent"],
      ["--", "start_date"],
      ["--", "due_date"],
      ["--", "created_at"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "ProjectMember",
    color: "#f97316",
    fields: [
      ["PK", "id"],
      ["FK", "project_id -> Project.id"],
      ["FK", "user_id -> User.id"],
      ["--", "role"],
      ["--", "status"],
      ["--", "joined_at"],
      ["UQ", "project_id + user_id"],
    ],
  },
  {
    name: "Task",
    color: "#dc2626",
    fields: [
      ["PK", "id"],
      ["FK", "project_id -> Project.id"],
      ["FK", "assigned_to_id -> User.id"],
      ["FK", "created_by_id -> User.id"],
      ["--", "title"],
      ["--", "description"],
      ["--", "status"],
      ["--", "priority"],
      ["--", "due_date"],
      ["--", "completed_at"],
      ["--", "created_at"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "TaskComment",
    color: "#9333ea",
    fields: [
      ["PK", "id"],
      ["FK", "task_id -> Task.id"],
      ["FK", "user_id -> User.id"],
      ["--", "message"],
      ["--", "created_at"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "TaskFile",
    color: "#4f46e5",
    fields: [
      ["PK", "id"],
      ["FK", "task_id -> Task.id"],
      ["FK", "uploaded_by_id -> User.id"],
      ["--", "file"],
      ["--", "original_name"],
      ["--", "file_size"],
      ["--", "uploaded_at"],
    ],
  },
  {
    name: "ProjectStatusRequest",
    color: "#be123c",
    fields: [
      ["PK", "id"],
      ["FK", "company_id -> Company.id"],
      ["FK", "project_id -> Project.id"],
      ["FK", "requested_by_id -> User.id"],
      ["FK", "requested_to_id -> User.id"],
      ["--", "title"],
      ["--", "message"],
      ["--", "due_date"],
      ["--", "status"],
      ["--", "created_at"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "ProjectStatusUpdate",
    color: "#0f766e",
    fields: [
      ["PK", "id"],
      ["FK", "status_request_id -> ProjectStatusRequest.id"],
      ["FK", "submitted_by_id -> User.id"],
      ["--", "summary"],
      ["--", "progress_percent"],
      ["--", "blockers"],
      ["--", "next_steps"],
      ["--", "submitted_at"],
    ],
  },
  {
    name: "Notification",
    color: "#0284c7",
    fields: [
      ["PK", "id"],
      ["FK", "recipient_id -> User.id"],
      ["FK", "actor_id -> User.id"],
      ["FK", "company_id -> Company.id"],
      ["FK", "team_id -> Team.id"],
      ["FK", "project_id -> Project.id"],
      ["FK", "task_id -> Task.id"],
      ["--", "category"],
      ["--", "title"],
      ["--", "message"],
      ["--", "is_read"],
      ["--", "created_at"],
      ["--", "read_at"],
    ],
  },
  {
    name: "CalendarEvent",
    color: "#c026d3",
    fields: [
      ["PK", "id"],
      ["FK", "company_id -> Company.id"],
      ["FK", "project_id -> Project.id"],
      ["FK", "task_id -> Task.id"],
      ["FK", "created_by_id -> User.id"],
      ["--", "title"],
      ["--", "description"],
      ["--", "start_at"],
      ["--", "end_at"],
      ["--", "location"],
      ["--", "event_type"],
      ["--", "priority"],
      ["--", "created_at"],
      ["--", "updated_at"],
    ],
  },
  {
    name: "ReportExport",
    color: "#475569",
    fields: [
      ["PK", "id"],
      ["FK", "company_id -> Company.id"],
      ["FK", "requested_by_id -> User.id"],
      ["--", "report_type"],
      ["--", "period_start"],
      ["--", "period_end"],
      ["--", "file"],
      ["--", "status"],
      ["--", "created_at"],
      ["--", "completed_at"],
    ],
  },
];

const tableMap = Object.fromEntries(tables.map((table) => [table.name, table]));

const relations = [
  ["UserProfile", "User", "user"],
  ["UserPreference", "User", "user"],
  ["Company", "User", "created_by"],
  ["CompanyInvitation", "Company", "company"],
  ["CompanyInvitation", "Team", "team"],
  ["CompanyInvitation", "User", "invited_by"],
  ["CompanyMember", "Company", "company"],
  ["CompanyMember", "User", "user"],
  ["Team", "Company", "company"],
  ["Team", "User", "lead, created_by"],
  ["TeamMember", "Team", "team"],
  ["TeamMember", "User", "user"],
  ["Project", "Team", "team"],
  ["Project", "User", "owner, created_by"],
  ["ProjectMember", "Project", "project"],
  ["ProjectMember", "User", "user"],
  ["Task", "Project", "project"],
  ["Task", "User", "assigned_to, created_by"],
  ["TaskComment", "Task", "task"],
  ["TaskComment", "User", "user"],
  ["TaskFile", "Task", "task"],
  ["TaskFile", "User", "uploaded_by"],
  ["ProjectStatusRequest", "Company", "company"],
  ["ProjectStatusRequest", "Project", "project"],
  ["ProjectStatusRequest", "User", "requested_by, requested_to"],
  ["ProjectStatusUpdate", "ProjectStatusRequest", "status_request"],
  ["ProjectStatusUpdate", "User", "submitted_by"],
  ["Notification", "User", "recipient, actor"],
  ["Notification", "Company", "company"],
  ["Notification", "Team", "team"],
  ["Notification", "Project", "project"],
  ["Notification", "Task", "task"],
  ["CalendarEvent", "Company", "company"],
  ["CalendarEvent", "Project", "project"],
  ["CalendarEvent", "Task", "task"],
  ["CalendarEvent", "User", "created_by"],
  ["ReportExport", "Company", "company"],
  ["ReportExport", "User", "requested_by"],
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tableHeight(table) {
  return 56 + table.fields.length * 26 + 18;
}

function drawBadge(kind, x, y) {
  const colors = {
    PK: "#f59e0b",
    FK: "#2563eb",
    UQ: "#7c3aed",
    "--": "#cbd5e1",
  };
  const textColor = kind === "--" ? "#475569" : "#ffffff";
  return `
    <rect x="${x}" y="${y - 14}" width="38" height="18" rx="5" fill="${colors[kind]}"/>
    <text x="${x + 19}" y="${y}" text-anchor="middle" class="badge" fill="${textColor}">${escapeXml(kind)}</text>`;
}

function drawTable(table, x, y, width = 356) {
  const height = tableHeight(table);
  const rows = table.fields
    .map(([kind, label], index) => {
      const rowY = y + 58 + index * 26;
      return `
        ${drawBadge(kind, x + 18, rowY)}
        <text x="${x + 66}" y="${rowY}" class="field">${escapeXml(label)}</text>`;
    })
    .join("");

  return `
    <g id="table-${table.name}">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="10" fill="#ffffff" stroke="#d7dee8" filter="url(#shadow)"/>
      <rect x="${x}" y="${y}" width="${width}" height="44" rx="10" fill="${table.color}"/>
      <path d="M${x},${y + 34} h${width} v10 h-${width} z" fill="${table.color}"/>
      <text x="${x + 18}" y="${y + 29}" class="title">${escapeXml(table.name)}</text>
      ${rows}
    </g>`;
}

function baseSvg(width, height, title, subtitle, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#0f172a" flood-opacity="0.13"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155"/>
    </marker>
    <style>
      .page { fill: #f4f7fb; }
      .heading { fill: #111827; font: 800 34px Arial, sans-serif; }
      .subheading { fill: #475569; font: 700 16px Arial, sans-serif; }
      .title { fill: white; font: 800 20px Arial, sans-serif; }
      .field { fill: #172033; font: 600 14px Arial, sans-serif; }
      .badge { font: 800 10px Arial, sans-serif; }
      .sectionLabel { fill: #334155; font: 800 15px Arial, sans-serif; letter-spacing: .4px; }
      .line { fill: none; stroke: #334155; stroke-width: 2.4; marker-end: url(#arrow); }
      .lineLabel { fill: #1f2937; font: 700 12px Arial, sans-serif; paint-order: stroke; stroke: #f4f7fb; stroke-width: 5; }
      .note { fill: #475569; font: 700 14px Arial, sans-serif; }
    </style>
  </defs>
  <rect class="page" x="0" y="0" width="${width}" height="${height}"/>
  <text x="40" y="54" class="heading">${escapeXml(title)}</text>
  <text x="40" y="83" class="subheading">${escapeXml(subtitle)}</text>
  ${body}
</svg>`;
}

function makeTableOnly() {
  const width = 2360;
  const cardWidth = 356;
  const gapX = 42;
  const gapY = 54;
  const startX = 40;
  const startY = 122;
  const cols = 6;
  const placements = {};
  let body = "";

  tables.forEach((table, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * 430;
    placements[table.name] = { x, y, width: cardWidth, height: tableHeight(table) };
    body += drawTable(table, x, y, cardWidth);
  });

  body += `
    <rect x="40" y="1808" width="860" height="42" rx="9" fill="#ffffff" stroke="#d7dee8"/>
    <text x="62" y="1835" class="note">Legend: PK = primary key, FK = foreign key with source table, UQ = unique field or unique constraint.</text>`;

  return baseSvg(
    width,
    1880,
    "MyTeam Manager - ER Diagram Without Relationship Arrows",
    "All app tables are shown with fields, primary keys, foreign keys, unique constraints, and FK source tables.",
    body
  );
}

const relationPositions = {
  User: [60, 122],
  UserProfile: [482, 122],
  UserPreference: [904, 122],
  Company: [60, 580],
  CompanyMember: [482, 580],
  CompanyInvitation: [904, 580],
  Team: [60, 1016],
  TeamMember: [482, 1016],
  Project: [904, 1016],
  ProjectMember: [1326, 1016],
  Task: [904, 1506],
  TaskComment: [1326, 1506],
  TaskFile: [1748, 1506],
  ProjectStatusRequest: [60, 1506],
  ProjectStatusUpdate: [482, 1506],
  Notification: [60, 1988],
  CalendarEvent: [482, 1988],
  ReportExport: [904, 1988],
};

function sidePoint(box, side, offset = 0) {
  if (side === "left") return [box.x, box.y + box.height / 2 + offset];
  if (side === "right") return [box.x + box.width, box.y + box.height / 2 + offset];
  if (side === "top") return [box.x + box.width / 2 + offset, box.y];
  return [box.x + box.width / 2 + offset, box.y + box.height];
}

function drawOrthogonal(from, to, label, lane = 0) {
  const a = relationPositions[from];
  const b = relationPositions[to];
  const fromBox = { x: a[0], y: a[1], width: 356, height: tableHeight(tableMap[from]) };
  const toBox = { x: b[0], y: b[1], width: 356, height: tableHeight(tableMap[to]) };
  const fromCenter = [fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2];
  const toCenter = [toBox.x + toBox.width / 2, toBox.y + toBox.height / 2];
  const horizontal = Math.abs(fromCenter[0] - toCenter[0]) >= Math.abs(fromCenter[1] - toCenter[1]);
  let start;
  let end;
  let points;

  if (horizontal) {
    const fromSide = fromCenter[0] < toCenter[0] ? "right" : "left";
    const toSide = fromCenter[0] < toCenter[0] ? "left" : "right";
    start = sidePoint(fromBox, fromSide, lane * 10);
    end = sidePoint(toBox, toSide, -lane * 10);
    const midX = (start[0] + end[0]) / 2 + lane * 8;
    points = [start, [midX, start[1]], [midX, end[1]], end];
  } else {
    const fromSide = fromCenter[1] < toCenter[1] ? "bottom" : "top";
    const toSide = fromCenter[1] < toCenter[1] ? "top" : "bottom";
    start = sidePoint(fromBox, fromSide, lane * 9);
    end = sidePoint(toBox, toSide, -lane * 9);
    const midY = (start[1] + end[1]) / 2 + lane * 8;
    points = [start, [start[0], midY], [end[0], midY], end];
  }

  const pointText = points.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`).join(" ");
  const labelX = points[Math.floor(points.length / 2)][0] + 8;
  const labelY = points[Math.floor(points.length / 2)][1] - 7;
  return `
    <polyline class="line" points="${pointText}"/>
    <text x="${labelX}" y="${labelY}" class="lineLabel">${escapeXml(label)}</text>`;
}

function makeRelationDiagram() {
  const width = 2160;
  const height = 2380;
  const cardWidth = 356;
  const placements = {};
  let body = "";

  Object.entries(relationPositions).forEach(([name, [x, y]]) => {
    placements[name] = { x, y, width: cardWidth, height: tableHeight(tableMap[name]) };
  });

  const localRelations = [
    ["UserProfile", "User", "user", 0],
    ["UserPreference", "User", "user", 1],
    ["Company", "User", "created_by", -1],
    ["CompanyMember", "Company", "company", 0],
    ["CompanyMember", "User", "user", 2],
    ["CompanyInvitation", "Company", "company", -1],
    ["CompanyInvitation", "Team", "team", 0],
    ["CompanyInvitation", "User", "invited_by", 3],
    ["Team", "Company", "company", 0],
    ["Team", "User", "lead / created_by", -2],
    ["TeamMember", "Team", "team", 0],
    ["TeamMember", "User", "user", 4],
    ["Project", "Team", "team", 0],
    ["Project", "User", "owner / created_by", 5],
    ["ProjectMember", "Project", "project", 0],
    ["ProjectMember", "User", "user", 6],
    ["Task", "Project", "project", 0],
    ["Task", "User", "assigned / created", 7],
    ["TaskComment", "Task", "task", 0],
    ["TaskComment", "User", "user", 8],
    ["TaskFile", "Task", "task", 1],
    ["TaskFile", "User", "uploaded_by", 9],
    ["ProjectStatusRequest", "Company", "company", -1],
    ["ProjectStatusRequest", "Project", "project", 1],
    ["ProjectStatusRequest", "User", "requested users", 10],
    ["ProjectStatusUpdate", "ProjectStatusRequest", "status_request", 0],
    ["ProjectStatusUpdate", "User", "submitted_by", 11],
    ["Notification", "User", "recipient / actor", -2],
    ["Notification", "Company", "company", 0],
    ["Notification", "Team", "team", 1],
    ["Notification", "Project", "project", 2],
    ["Notification", "Task", "task", 3],
    ["CalendarEvent", "Company", "company", -1],
    ["CalendarEvent", "Project", "project", 0],
    ["CalendarEvent", "Task", "task", 1],
    ["CalendarEvent", "User", "created_by", 12],
    ["ReportExport", "Company", "company", 2],
    ["ReportExport", "User", "requested_by", 13],
  ];

  body += `
    <text x="60" y="114" class="sectionLabel">Accounts</text>
    <text x="60" y="572" class="sectionLabel">Company Workspace</text>
    <text x="60" y="1008" class="sectionLabel">Teams And Projects</text>
    <text x="60" y="1498" class="sectionLabel">Work, Requests, Files</text>
    <text x="60" y="1980" class="sectionLabel">Calendar, Reports, Notifications</text>`;

  body += localRelations.map(([from, to, label, lane]) => drawOrthogonal(from, to, label, lane)).join("");

  tables.forEach((table) => {
    const position = placements[table.name];
    body += drawTable(table, position.x, position.y, cardWidth);
  });

  body += `
    <rect x="60" y="2308" width="1020" height="42" rx="9" fill="#ffffff" stroke="#d7dee8"/>
    <text x="82" y="2335" class="note">Line rule: straight orthogonal lines point from child/FK table to parent/source table. Field rows still show every FK source table.</text>`;

  return baseSvg(
    width,
    height,
    "MyTeam Manager - ER Diagram With Relationship Arrows",
    "All tables, fields, keys, and FK source tables, with straight relationship connectors.",
    body
  );
}

fs.writeFileSync(path.join(outDir, "myteam_erd_no_arrows.svg"), makeTableOnly());
fs.writeFileSync(path.join(outDir, "myteam_erd_with_arrows.svg"), makeRelationDiagram());
console.log("Generated ERD SVG files in er_diagrams/");
