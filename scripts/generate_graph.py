#!/usr/bin/env python3
"""
Nexus Technologies — Organisational Knowledge Graph
Uses NetworkX + PyVis to generate an interactive force-directed HTML graph.
Run:  python3 scripts/generate_graph.py
Output: frontend/public/knowledge_graph.html
"""

import os
import json
from pyvis.network import Network

# Card HTML stored here; injected into JS so hover tooltip is gone
NODE_TITLES: dict = {}

# ─────────────────────────────────────────────────────────────
# Colour palette (matches mockData.ts / Chakra theme)
# ─────────────────────────────────────────────────────────────
TC = {                          # Team colours
    "Leadership":       "#9F7AEA",
    "Backend Platform": "#4299E1",
    "Frontend":         "#48BB78",
    "Infrastructure":   "#F6AD55",
    "Security":         "#FC8181",
    "QA":               "#F6E05E",
}

def c(bg, border=None):
    border = border or bg
    return {"background": bg, "border": border,
            "highlight": {"background": bg, "border": "#F1F5F9"}}

# ─────────────────────────────────────────────────────────────
# Network
# ─────────────────────────────────────────────────────────────
net = Network(
    height="100vh",
    width="100%",
    bgcolor="#0F172A",
    font_color="#E2E8F0",
    directed=True,
    notebook=False,
)

# ─────────────────────────────────────────────────────────────
# Node helpers
# ─────────────────────────────────────────────────────────────

def person(nid, name, role, team, email):
    tier = ("executive" if role == "CTO" else
            "vp"        if any(x in role for x in ["VP", "Head of"]) else
            "lead"      if "Lead" in role else
            "senior"    if "Senior" in role else
            "engineer")
    sz = {"executive": 52, "vp": 42, "lead": 32, "senior": 23, "engineer": 16}[tier]
    fsz = {"executive": 16, "vp": 14, "lead": 13, "senior": 12, "engineer": 11}[tier]
    bg = TC.get(team, "#718096")
    NODE_TITLES[nid] = (
        f'<div style="font:13px system-ui;min-width:200px;padding:8px 4px">'
        f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        f'<div style="width:36px;height:36px;border-radius:50%;background:{bg};'
        f'display:flex;align-items:center;justify-content:center;'
        f'font-size:14px;font-weight:800;color:#1A202C;flex-shrink:0">'
        f'{name[0]}</div>'
        f'<div><b style="font-size:15px;color:#F1F5F9;display:block">{name}</b>'
        f'<span style="color:#94A3B8;font-size:12px">{role}</span></div></div>'
        f'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">'
        f'<span style="background:{bg};color:#1A202C;padding:2px 8px;'
        f'border-radius:20px;font-size:11px;font-weight:700">{team}</span>'
        f'<span style="background:#1E293B;color:#94A3B8;padding:2px 8px;'
        f'border-radius:20px;font-size:11px">{tier.upper()}</span></div>'
        f'<span style="color:#475569;font-size:11px">&#9993; {email}</span></div>'
    )
    net.add_node(
        nid,
        label=name.split()[0],
        color=c(bg, "#1A202C"),
        size=sz,
        shape="dot",
        group=team,
        font={"size": fsz, "color": "#F1F5F9", "bold": {"color": "#FFFFFF", "size": fsz, "vadjust": 0}},
        borderWidth=3 if tier in ("executive", "vp") else 2 if tier == "lead" else 1,
    )

def ticket(nid, key, ttl, status, priority, shadow, conflict):
    if conflict:   bg, brd, sz = "#FC8181", "#E53E3E", 22
    elif shadow:   bg, brd, sz = "#F6AD55", "#DD6B20", 20
    elif status == "done":    bg, brd, sz = "#68D391", "#38A169", 14
    elif status == "blocked": bg, brd, sz = "#FC8181", "#E53E3E", 18
    else:          bg, brd, sz = "#63B3ED", "#3182CE", 16
    pcolor = {"critical":"#FC8181","high":"#F6AD55","medium":"#F6E05E","low":"#68D391"}.get(priority,"#A0AEC0")
    scolor = {"done":"#68D391","blocked":"#FC8181","in_progress":"#63B3ED","todo":"#94A3B8"}.get(status,"#94A3B8")
    badges = ""
    if shadow:   badges += f'<span style="background:#7C3A00;color:#F6AD55;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700">⚠ Not Escalated</span> '
    if conflict: badges += f'<span style="background:#7F1D1D;color:#FC8181;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700">🚨 Conflict</span>'
    NODE_TITLES[nid] = (
        f'<div style="font:13px system-ui;min-width:230px;padding:8px 4px">'
        f'<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
        f'<div style="width:32px;height:32px;border-radius:6px;background:{bg};'
        f'display:flex;align-items:center;justify-content:center;'
        f'font-size:10px;font-weight:800;color:#1A202C;flex-shrink:0">JIRA</div>'
        f'<div><b style="font-size:15px;color:#F1F5F9;display:block">{key}</b>'
        f'<span style="color:#64748B;font-size:10px">JIRA Ticket</span></div></div>'
        f'<p style="color:#CBD5E0;font-size:12px;margin:0 0 8px;line-height:1.4">{ttl[:80]}</p>'
        f'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">'
        f'<span style="background:#1E293B;color:{scolor};padding:2px 8px;border-radius:20px;font-size:11px">{status.replace("_"," ").upper()}</span>'
        f'<span style="color:{pcolor};font-size:11px;padding:2px 4px">● {priority.upper()}</span></div>'
        f'<div style="display:flex;gap:4px;flex-wrap:wrap">{badges}</div></div>'
    )
    net.add_node(
        nid,
        label=key,
        color=c(bg, brd),
        size=sz,
        shape="square",
        group="Ticket",
        font={"size": 11, "color": "#1E293B", "bold": {"color": "#0F172A", "size": 11}},
    )

def pr(nid, number, ttl, status, shadow, conflict):
    if shadow:              bg, brd, sz = "#F6AD55", "#DD6B20", 20
    elif status == "merged":bg, brd, sz = "#B794F4", "#805AD5", 15
    elif status == "draft": bg, brd, sz = "#718096", "#4A5568", 13
    elif conflict:          bg, brd, sz = "#FC8181", "#E53E3E", 20
    else:                   bg, brd, sz = "#68D391", "#38A169", 16
    scolor = {"merged":"#B794F4","draft":"#94A3B8","open":"#68D391"}.get(status,"#94A3B8")
    badges = ""
    if shadow:    badges += f'<span style="background:#7C3A00;color:#F6AD55;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700">⚠ Not Escalated</span> '
    if status == "draft": badges += f'<span style="background:#2D3748;color:#A0AEC0;padding:2px 7px;border-radius:20px;font-size:10px">Draft</span> '
    if conflict:  badges += f'<span style="background:#7F1D1D;color:#FC8181;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700">🚨 Conflict</span>'
    NODE_TITLES[nid] = (
        f'<div style="font:13px system-ui;min-width:230px;padding:8px 4px">'
        f'<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
        f'<div style="width:32px;height:32px;border-radius:6px;background:{bg};'
        f'display:flex;align-items:center;justify-content:center;'
        f'font-size:10px;font-weight:800;color:#1A202C;flex-shrink:0">PR</div>'
        f'<div><b style="font-size:15px;color:#F1F5F9;display:block">PR #{number}</b>'
        f'<span style="color:#64748B;font-size:10px">Pull Request</span></div></div>'
        f'<p style="color:#CBD5E0;font-size:12px;margin:0 0 8px;line-height:1.4">{ttl[:80]}</p>'
        f'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">'
        f'<span style="background:#1E293B;color:{scolor};padding:2px 8px;border-radius:20px;font-size:11px">{status.upper()}</span></div>'
        f'<div style="display:flex;gap:4px;flex-wrap:wrap">{badges}</div></div>'
    )
    net.add_node(
        nid,
        label=f"#{number}",
        color=c(bg, brd),
        size=sz,
        shape="triangle",
        group="PullRequest",
        font={"size": 11, "color": "#F1F5F9"},
    )

def project(nid, key, name, team):
    bg = TC.get(team, "#2D3748")
    NODE_TITLES[nid] = (
        f'<div style="font:13px system-ui;min-width:200px;padding:8px 4px">'
        f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        f'<div style="width:32px;height:32px;border-radius:8px;background:{bg};'
        f'display:flex;align-items:center;justify-content:center;'
        f'font-size:11px;font-weight:800;color:#1A202C;flex-shrink:0">{key}</div>'
        f'<div><b style="font-size:15px;color:#F1F5F9;display:block">{name}</b>'
        f'<span style="color:#64748B;font-size:11px">Project · {team}</span></div></div></div>'
    )
    net.add_node(
        nid,
        label=key,
        color=c(bg, "#CBD5E0"),
        size=46,
        shape="ellipse",
        group="Project",
        borderWidth=2,
    )

def policy(nid, code, desc):
    NODE_TITLES[nid] = (
        f'<div style="font:13px system-ui;min-width:210px;padding:8px 4px">'
        f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        f'<div style="width:32px;height:32px;background:#6B46C1;'
        f'clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);'
        f'flex-shrink:0"></div>'
        f'<div><b style="font-size:14px;color:#E9D8FD;display:block">{code}</b>'
        f'<span style="color:#64748B;font-size:10px">Company Policy</span></div></div>'
        f'<p style="color:#CBD5E0;font-size:12px;margin:0;line-height:1.5">{desc}</p></div>'
    )
    net.add_node(
        nid,
        label=code,
        color=c("#6B46C1", "#553C9A"),
        size=36,
        shape="hexagon",
        group="Policy",
        borderWidth=2,
    )

# ─────────────────────────────────────────────────────────────
# Edge helper
# ─────────────────────────────────────────────────────────────
def edge(src, dst, lbl, col, w=1.5, dash=False):
    net.add_edge(src, dst, label=lbl,
                 color={"color": col, "highlight": "#F1F5F9"},
                 width=w, dashes=dash, arrows="to")

# ─────────────────────────────────────────────────────────────
# ── People ──────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────
for args in [
    ("u-001","Grace Liu",        "CTO",                     "Leadership",       "grace.liu@nexus.tech"),
    ("u-002","Michael Park",     "VP Engineering",          "Leadership",       "michael.park@nexus.tech"),
    ("u-003","Rachel Foster",    "Head of Product",         "Leadership",       "rachel.foster@nexus.tech"),
    ("u-004","Alice Chen",       "Backend Lead",            "Backend Platform", "alice.chen@nexus.tech"),
    ("u-005","David Kim",        "Senior Backend Engineer", "Backend Platform", "david.kim@nexus.tech"),
    ("u-006","Priya Patel",      "Backend Engineer",        "Backend Platform", "priya.patel@nexus.tech"),
    ("u-007","James Wu",         "Backend Engineer",        "Backend Platform", "james.wu@nexus.tech"),
    ("u-008","Jack Williams",    "Frontend Lead",           "Frontend",         "jack.williams@nexus.tech"),
    ("u-009","Sarah Chen",       "Senior Frontend Engineer","Frontend",         "sarah.chen@nexus.tech"),
    ("u-010","Tom Baker",        "Frontend Engineer",       "Frontend",         "tom.baker@nexus.tech"),
    ("u-011","Maya Rodriguez",   "Frontend Engineer",       "Frontend",         "maya.r@nexus.tech"),
    ("u-012","Bob Martinez",     "DevOps Lead",             "Infrastructure",   "bob.martinez@nexus.tech"),
    ("u-013","Carlos Rodriguez", "Senior DevOps Engineer",  "Infrastructure",   "carlos.r@nexus.tech"),
    ("u-014","Nina Patel",       "DevOps Engineer",         "Infrastructure",   "nina.patel@nexus.tech"),
    ("u-015","Irene Garcia",     "Security Lead",           "Security",         "irene.garcia@nexus.tech"),
    ("u-016","Marcus Thompson",  "Security Engineer",       "Security",         "marcus.t@nexus.tech"),
    ("u-017","Leo Zhang",        "QA Lead",                 "QA",               "leo.zhang@nexus.tech"),
    ("u-018","Emma Wilson",      "QA Engineer",             "QA",               "emma.wilson@nexus.tech"),
]:
    person(*args)

# ── Projects ─────────────────────────────────────────────────
for args in [
    ("proj-001","CORE","Nexus Core Backend",      "Backend Platform"),
    ("proj-002","WEB", "Nexus Web Application",   "Frontend"),
    ("proj-003","INFRA","Infrastructure & DevOps","Infrastructure"),
    ("proj-004","SEC", "Security Initiative",     "Security"),
    ("proj-005","QA",  "Quality Assurance",       "QA"),
]:
    project(*args)

# ── Policies ─────────────────────────────────────────────────
policy("pol-001","SEC-STD-012",
       "OAuth 2.0 mandatory for ALL APIs. Basic Auth is prohibited company-wide.")
policy("pol-002","INFRA-STD-001",
       "Memcached is the approved caching technology. Redis not yet authorised.")

# ── JIRA Tickets ─────────────────────────────────────────────
for args in [
    ("t-sec001","SEC-001","Implement OAuth 2.0 as mandatory API standard",              "done",        "critical",False,False),
    ("t-sec002","SEC-002","Security audit: scan all endpoints for Basic Auth usage",    "in_progress", "high",    False,False),
    ("t-sec007","SEC-007","CRITICAL: Basic Auth violation in 3 production endpoints",   "todo",        "critical",True, True),
    ("t-c078",  "CORE-078","Implement Redis caching layer for transaction queries",     "in_progress", "high",    False,False),
    ("t-c079",  "CORE-079","Migrate existing Memcached cache to Redis (blocked)",       "blocked",     "high",    False,True),
    ("t-c082",  "CORE-082","Redis integration merged to staging — pending prod approval","in_progress","high",    False,False),
    ("t-w045",  "WEB-045", "User auth endpoints — Basic Auth deployed to production",   "done",        "high",    True, True),
    ("t-w046",  "WEB-046", "Notifications API integration — Basic Auth deployed",       "done",        "medium",  True, True),
    ("t-w047",  "WEB-047", "Settings page API — Basic Auth deployed",                   "done",        "medium",  True, True),
    ("t-w051",  "WEB-051", "[DRAFT] Migrate user endpoints from Basic Auth to OAuth",   "in_progress", "critical",True, False),
    ("t-i023",  "INFRA-023","Evaluate Redis vs Memcached — recommend Memcached",        "done",        "medium",  False,True),
    ("t-i024",  "INFRA-024","Caching standards: formal policy doc (blocked)",           "blocked",     "high",    False,True),
    ("t-i025",  "INFRA-025","Redis ElastiCache Terraform config (blocked, not approved)","blocked",    "high",    False,False),
    ("t-q034",  "QA-034",  "Cache benchmark: Redis 40% faster than Memcached",          "done",        "high",    False,False),
    ("t-q037",  "QA-037",  "Auth regression test — Basic Auth confirmed insecure",      "done",        "critical",False,True),
]:
    ticket(*args)

# ── Pull Requests ─────────────────────────────────────────────
for args in [
    ("pr-289",289,"feat: Redis caching layer for transaction queries",          "open",   False,True),
    ("pr-291",291,"chore: Increase Memcached connection pool size to 50",       "merged", False,True),
    ("pr-292",292,"feat: Redis migration scripts — Memcached → Redis",          "open",   False,False),
    ("pr-267",267,"feat: User profile auth — /api/user-profile (Basic Auth)",   "merged", True, True),
    ("pr-268",268,"feat: Notifications API integration (Basic Auth)",           "merged", True, True),
    ("pr-271",271,"feat: Settings page — /api/user-settings (Basic Auth)",      "merged", True, True),
    ("pr-294",294,"[DRAFT] fix: Migrate user endpoints to OAuth 2.0",           "draft",  True, False),
    ("pr-045", 45,"feat: Redis ElastiCache cluster — Terraform config",         "open",   False,False),
]:
    pr(*args)

# ─────────────────────────────────────────────────────────────
# ── Edges ────────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────

# REPORTS_TO  (person → manager)
for s,d in [
    ("u-002","u-001"),("u-003","u-001"),
    ("u-004","u-002"),("u-008","u-002"),("u-012","u-002"),("u-015","u-002"),("u-017","u-002"),
    ("u-005","u-004"),("u-006","u-004"),("u-007","u-004"),
    ("u-009","u-008"),("u-010","u-008"),("u-011","u-008"),
    ("u-013","u-012"),("u-014","u-012"),
    ("u-016","u-015"),
    ("u-018","u-017"),
]:
    edge(s,d,"REPORTS_TO","#334155",1.0)

# ASSIGNED_TO  (ticket → person)
for s,d in [
    ("t-sec001","u-015"),("t-sec002","u-016"),("t-sec007","u-015"),
    ("t-c078","u-004"),  ("t-c079","u-005"),  ("t-c082","u-004"),
    ("t-w045","u-008"),  ("t-w046","u-009"),  ("t-w047","u-010"),("t-w051","u-008"),
    ("t-i023","u-012"),  ("t-i024","u-013"),  ("t-i025","u-013"),
    ("t-q034","u-017"),  ("t-q037","u-018"),
]:
    edge(s,d,"ASSIGNED_TO","#4299E1",2.0)

# AUTHORED_BY  (PR → person)
for s,d in [
    ("pr-289","u-004"),("pr-291","u-012"),("pr-292","u-005"),
    ("pr-267","u-008"),("pr-268","u-009"),("pr-271","u-010"),
    ("pr-294","u-008"),("pr-045","u-013"),
]:
    edge(s,d,"AUTHORED_BY","#48BB78",2.0)

# REVIEWED_BY  (PR → reviewer)
for s,d in [
    ("pr-289","u-005"),("pr-289","u-012"),
    ("pr-292","u-004"),
    ("pr-267","u-009"),("pr-268","u-008"),("pr-271","u-008"),
    ("pr-045","u-012"),
]:
    edge(s,d,"REVIEWED_BY","#9AE6B4",1.2)

# LINKED_TO  (ticket ↔ PR)
for s,d in [
    ("t-c078","pr-289"),("t-c079","pr-292"),
    ("t-w045","pr-267"),("t-w046","pr-268"),("t-w047","pr-271"),("t-w051","pr-294"),
    ("t-i025","pr-045"),("t-i023","pr-291"),
]:
    edge(s,d,"LINKED_TO","#475569",1.0,True)

# VIOLATES policy
for s,p in [
    ("t-w045","pol-001"),("t-w046","pol-001"),("t-w047","pol-001"),("t-w051","pol-001"),
    ("pr-267","pol-001"),("pr-268","pol-001"),("pr-271","pol-001"),
    ("t-i023","pol-002"),("pr-291","pol-002"),
]:
    edge(s,p,"VIOLATES","#FC8181",2.5,True)

# CONFLICTS_WITH
for a,b in [
    ("t-c078","t-i023"),
    ("t-w045","t-sec001"),("t-w046","t-sec001"),("t-w047","t-sec001"),
    ("t-c079","t-i024"),
    ("pr-289","pr-291"),
    ("t-sec007","t-w045"),
]:
    edge(a,b,"CONFLICTS_WITH","#F56565",3.0)

# SUPPORTS / EVIDENCE
for s,d in [
    ("t-q034","t-c078"),   # benchmark → redis proposal
    ("t-sec002","t-sec007"),# audit → violation discovery
    ("t-q037","t-sec007"),  # regression → confirms violation
    ("t-c082","t-c078"),    # staging success → redis proposal
]:
    edge(s,d,"SUPPORTS","#9AE6B4",2.0)

# DEPENDS_ON
for s,d in [
    ("t-c079","t-i024"),   # migration depends on policy
    ("t-i025","t-i024"),   # terraform depends on policy
    ("t-c082","t-i025"),   # staging deploy depends on infra
]:
    edge(s,d,"DEPENDS_ON","#F6AD55",2.0,True)

# PART_OF  (ticket → project)
for s,p in [
    ("t-sec001","proj-004"),("t-sec002","proj-004"),("t-sec007","proj-004"),
    ("t-c078","proj-001"),  ("t-c079","proj-001"),  ("t-c082","proj-001"),
    ("t-w045","proj-002"),  ("t-w046","proj-002"),  ("t-w047","proj-002"),("t-w051","proj-002"),
    ("t-i023","proj-003"),  ("t-i024","proj-003"),  ("t-i025","proj-003"),
    ("t-q034","proj-005"),  ("t-q037","proj-005"),
]:
    edge(s,p,"PART_OF","#1E293B",1.0,True)

# ─────────────────────────────────────────────────────────────
# Physics & Interaction
# ─────────────────────────────────────────────────────────────
net.set_options("""{
  "physics": {
    "enabled": true,
    "barnesHut": {
      "gravitationalConstant": -9000,
      "centralGravity": 0.08,
      "springLength": 160,
      "springConstant": 0.035,
      "damping": 0.1,
      "avoidOverlap": 0.5
    },
    "maxVelocity": 60,
    "minVelocity": 0.12,
    "solver": "barnesHut",
    "stabilization": {"enabled": true, "iterations": 400, "updateInterval": 30}
  },
  "interaction": {
    "hover": true,
    "tooltipDelay": 60,
    "multiselect": true,
    "navigationButtons": true,
    "keyboard": {"enabled": true, "bindToWindow": false},
    "zoomView": true,
    "hideEdgesOnDrag": true
  },
  "edges": {
    "arrows": {"to": {"enabled": true, "scaleFactor": 0.55}},
    "smooth": {"enabled": true, "type": "dynamic"},
    "font": {"size": 10, "color": "#94A3B8", "align": "middle",
             "strokeWidth": 3, "strokeColor": "#0F172A", "background": "rgba(15,23,42,0.8)"},
    "hoverWidth": 2.5,
    "selectionWidth": 3
  },
  "nodes": {
    "font": {"face": "system-ui, -apple-system, sans-serif", "size": 12, "color": "#F1F5F9",
             "strokeWidth": 3, "strokeColor": "#0F172A"},
    "borderWidthSelected": 4,
    "scaling": {"min": 12, "max": 55}
  }
}""")

# ─────────────────────────────────────────────────────────────
# Save & Inject UI Overlay
# ─────────────────────────────────────────────────────────────
n_nodes = len(net.nodes)
n_edges = len(net.edges)

out_dir  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/public")
out_path = os.path.join(out_dir, "knowledge_graph.html")
os.makedirs(out_dir, exist_ok=True)
net.save_graph(out_path)

# Read generated HTML and inject overlay UI
with open(out_path, "r") as fh:
    html = fh.read()

OVERLAY = f"""
<style>
  body {{ margin:0; overflow:hidden; background:#0F172A;
         font-family: system-ui, -apple-system, sans-serif; }}
  .panel {{
    position:fixed; z-index:1000;
    background:rgba(15,23,42,0.92);
    border:1px solid #1E293B;
    border-radius:12px;
    padding:12px 16px;
    backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
  }}
  #gTitle {{ top:14px; left:14px; min-width:200px; }}
  #gTitle h3 {{ margin:0 0 2px; font-size:15px; font-weight:800; color:#F1F5F9; }}
  #gTitle p  {{ margin:0; font-size:11px; color:#64748B; }}
  #gStats {{ top:14px; right:14px; min-width:160px; }}
  #gStats h4 {{ margin:0 0 8px; font-size:10px; font-weight:700;
                text-transform:uppercase; letter-spacing:.07em; color:#94A3B8; }}
  .sr {{ display:flex; justify-content:space-between; gap:20px; margin:3px 0; font-size:12px; }}
  .sv {{ font-weight:700; color:#E2E8F0; }}
  .sl {{ color:#64748B; }}
  #gLegend {{ bottom:14px; left:14px; }}
  #gLegend h4 {{ margin:0 0 8px; font-size:10px; font-weight:700;
                 text-transform:uppercase; letter-spacing:.07em; color:#94A3B8; }}
  .lg {{ display:grid; grid-template-columns:1fr 1fr; gap:3px 18px; }}
  .lr {{ display:flex; align-items:center; gap:6px; font-size:10px; color:#94A3B8; }}
  .ld {{ width:10px; height:10px; border-radius:50%; flex-shrink:0; }}
  .ls {{ width:10px; height:10px; border-radius:2px; flex-shrink:0; }}
  #gEdge {{ bottom:14px; right:14px; }}
  #gEdge h4 {{ margin:0 0 8px; font-size:10px; font-weight:700;
               text-transform:uppercase; letter-spacing:.07em; color:#94A3B8; }}
  .el {{ display:flex; align-items:center; gap:6px; margin:3px 0; font-size:10px; color:#94A3B8; }}
  .eline {{ height:2px; width:20px; flex-shrink:0; border-radius:1px; }}

  /* ── Node Info Card ──────────────────────────────────────── */
  #nodeInfoCard {{
    display: none;
    position: fixed;
    z-index: 2000;
    background: rgba(15,23,42,0.97);
    border: 1px solid #334155;
    border-radius: 14px;
    padding: 16px;
    min-width: 240px;
    max-width: 300px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    animation: cardIn 0.18s ease;
    pointer-events: auto;
  }}
  @keyframes cardIn {{
    from {{ opacity:0; transform:scale(0.94) translateY(4px); }}
    to   {{ opacity:1; transform:scale(1) translateY(0); }}
  }}
  #nodeCardClose {{
    position:absolute; top:10px; right:12px;
    background:none; border:none; color:#64748B;
    font-size:18px; cursor:pointer; line-height:1;
    padding:2px 4px; border-radius:4px;
  }}
  #nodeCardClose:hover {{ color:#F1F5F9; background:#1E293B; }}

  /* ── Selected node pulse ─────────────────────────────────── */
  @keyframes pulse {{ 0%,100%{{opacity:1}} 50%{{opacity:0.6}} }}
</style>

<!-- Title -->
<div id="gTitle" class="panel">
  <h3>&#127970; Nexus Technologies</h3>
  <p>Organisational Knowledge Graph &bull; Q1 Sprint 3 &bull; 2026</p>
</div>

<!-- Stats -->
<div id="gStats" class="panel">
  <h4>Graph Statistics</h4>
  <div class="sr"><span class="sl">Nodes</span><span class="sv">{n_nodes}</span></div>
  <div class="sr"><span class="sl">Relationships</span><span class="sv">{n_edges}</span></div>
  <div class="sr"><span class="sl">People</span><span class="sv">18</span></div>
  <div class="sr"><span class="sl">JIRA Tickets</span><span class="sv">15</span></div>
  <div class="sr"><span class="sl">Pull Requests</span><span class="sv">8</span></div>
  <div class="sr"><span class="sl">Projects</span><span class="sv">5</span></div>
  <div class="sr"><span class="sl">Policies</span><span class="sv">2</span></div>
  <hr style="border-color:#1E293B;margin:6px 0">
  <div class="sr"><span class="sl" style="color:#FC8181">&#9888; Conflicts</span>
                  <span class="sv" style="color:#FC8181">7</span></div>
  <div class="sr"><span class="sl" style="color:#F6AD55">&#9888; Not Escalated</span>
                  <span class="sv" style="color:#F6AD55">4</span></div>
</div>

<!-- Node Legend -->
<div id="gLegend" class="panel">
  <h4>Nodes</h4>
  <div class="lg">
    <div class="lr"><div class="ld" style="background:#9F7AEA"></div>Leadership</div>
    <div class="lr"><div class="ld" style="background:#4299E1"></div>Backend</div>
    <div class="lr"><div class="ld" style="background:#48BB78"></div>Frontend</div>
    <div class="lr"><div class="ld" style="background:#F6AD55"></div>Infrastructure</div>
    <div class="lr"><div class="ld" style="background:#FC8181"></div>Security</div>
    <div class="lr"><div class="ld" style="background:#F6E05E"></div>QA</div>
    <div class="lr"><div class="ls" style="background:#63B3ED"></div>Ticket</div>
    <div class="lr"><div class="ls" style="background:#FC8181"></div>Conflict Ticket</div>
    <div class="lr"><div class="ls" style="background:#F6AD55"></div>Not Escalated</div>
    <div class="lr">
      <div style="width:0;height:0;border-left:5px solid transparent;
           border-right:5px solid transparent;border-bottom:9px solid #68D391;flex-shrink:0"></div>PR Open
    </div>
    <div class="lr">
      <div style="width:0;height:0;border-left:5px solid transparent;
           border-right:5px solid transparent;border-bottom:9px solid #B794F4;flex-shrink:0"></div>PR Merged
    </div>
    <div class="lr">
      <div style="width:12px;height:10px;background:#6B46C1;
           clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);flex-shrink:0"></div>Policy
    </div>
    <div class="lr">
      <div style="width:14px;height:10px;background:#4299E1;border-radius:50%;flex-shrink:0"></div>Project
    </div>
  </div>
</div>

<!-- Edge Legend -->
<div id="gEdge" class="panel">
  <h4>Relationships</h4>
  <div class="el"><div class="eline" style="background:#334155"></div>REPORTS_TO</div>
  <div class="el"><div class="eline" style="background:#4299E1"></div>ASSIGNED_TO</div>
  <div class="el"><div class="eline" style="background:#48BB78"></div>AUTHORED_BY</div>
  <div class="el"><div class="eline" style="background:#9AE6B4"></div>REVIEWED_BY / SUPPORTS</div>
  <div class="el"><div class="eline" style="background:#FC8181"></div>VIOLATES / CONFLICTS_WITH</div>
  <div class="el"><div class="eline" style="background:#F6AD55;opacity:.7"></div>DEPENDS_ON (dashed)</div>
  <div class="el"><div class="eline" style="background:#1E293B;border:1px solid #334155"></div>LINKED_TO / PART_OF</div>
</div>

<!-- Hint -->
<div style="position:fixed;bottom:14px;left:50%;transform:translateX(-50%);
            background:rgba(15,23,42,.7);border:1px solid #1E293B;border-radius:8px;
            padding:5px 14px;font-size:10px;color:#475569;z-index:1000;pointer-events:none">
  Scroll to zoom &bull; Drag to pan &bull; <b style="color:#7C93B0">Click node</b> for details &bull; Drag nodes to rearrange
</div>

<!-- Node Info Card (populated by JS on click) -->
<div id="nodeInfoCard">
  <button id="nodeCardClose" onclick="document.getElementById('nodeInfoCard').style.display='none'">&#x2715;</button>
  <div id="nodeCardBody"></div>
</div>

<script>
// Node card HTML keyed by node ID — no vis.js tooltip needed
var NODE_TITLES = {json.dumps(NODE_TITLES)};

(function() {{
  var attempts = 0;
  var init = setInterval(function() {{
    attempts++;
    if (typeof network !== 'undefined') {{
      clearInterval(init);
      attachClickHandler();
    }}
    if (attempts > 80) clearInterval(init);
  }}, 100);

  function attachClickHandler() {{
    var card = document.getElementById('nodeInfoCard');
    var body = document.getElementById('nodeCardBody');

    network.on('click', function(params) {{
      if (params.nodes.length === 0) {{
        card.style.display = 'none';
        return;
      }}

      var nodeId = params.nodes[0];
      var html   = NODE_TITLES[nodeId] || '<span style="color:#64748B">No details</span>';
      body.innerHTML = html;

      var cx = params.pointer.DOM.x;
      var cy = params.pointer.DOM.y;
      var W  = window.innerWidth;
      var H  = window.innerHeight;
      var cW = 300;
      var cH = 220;

      var left = cx + 18;
      var top  = cy - 30;
      if (left + cW > W - 10) left = cx - cW - 18;
      if (left < 10)           left = 10;
      if (top + cH > H - 10)  top  = H - cH - 10;
      if (top < 10)            top  = 10;

      card.style.left    = left + 'px';
      card.style.top     = top  + 'px';
      card.style.display = 'block';
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = 'cardIn 0.18s ease';
    }});

    document.addEventListener('keydown', function(e) {{
      if (e.key === 'Escape') card.style.display = 'none';
    }});
  }}
}})();
</script>
"""

html = html.replace("</body>", OVERLAY + "\n</body>")

with open(out_path, "w") as fh:
    fh.write(html)

print(f"✅  Knowledge graph saved → {out_path}")
print(f"    {n_nodes} nodes · {n_edges} relationships")
print(f"    Open: http://localhost:3000/knowledge_graph.html")
