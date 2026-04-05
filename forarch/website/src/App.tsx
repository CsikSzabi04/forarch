import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Shield, 
  Activity, 
  ChevronRight,
  Layers,
  Zap,
  AlertTriangle,
  Terminal,
  Database,
  LogOut
} from 'lucide-react';

import { auth } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { AuthCard } from './components/AuthCard';
import { RemoteTerminal } from './components/RemoteTerminal';

function GridBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div className="grid-bg" style={{ transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)` }} />
      <div className="spotlight" style={{ left: mousePosition.x, top: mousePosition.y }} />
    </>
  );
}

function NavBar({ setView }: { setView: (v: any) => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}
    >
      <div className="container mx-auto px-6">
        <div className={`glass-header rounded-2xl px-6 py-3 flex items-center justify-between transition-all ${scrolled ? 'bg-opacity-90' : ''}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center pulse-glow">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">ForArch</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('home')} className="text-sm font-medium hover:text-brand-400 transition-colors">Home</button>
            <button onClick={() => setView('dashboard')} className="text-sm font-medium hover:text-brand-400 transition-colors">Dashboard</button>
            <button 
              onClick={() => window.open('https://github.com/CsikSzabi04/forarch', '_blank')}
              className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection({ setView }: { setView: (v: any) => void }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-6">
              v1.0.5 - Proactive Dependency Maintenance
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              <span className="text-white">Software </span>
              <span className="gradient-text">Archaeology</span>
              <br />
              <span className="text-white">For the Modern Web</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Predict library decay, uncover legacy patterns, and automate your project's modernization before technical debt becomes a liability.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setView('dashboard')}
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-600/20"
              >
                Launch Dashboard
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#about"
                className="w-full sm:w-auto glass-panel hover:bg-white/5 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="glass-panel rounded-3xl p-4 md:p-8 pulse-glow">
              <img 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070" 
                alt="Code Analysis Dashboard"
                className="rounded-2xl border border-white/5 shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const features = [
    { icon: <Activity className="text-emerald-400" />, title: "Decay Prediction", desc: "Our engine analyzes download trends and maintenance schedules to predict when a library will become legacy." },
    { icon: <Search className="text-blue-400" />, title: "Deep Static Analysis", desc: "Identify deep-nested deprecated patterns like obsolete variable calls and legacy console hacks." },
    { icon: <Zap className="text-purple-400" />, title: "Auto-Remediation", desc: "Generate executable scripts to automate library upgrades across your entire system." }
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="text-brand-400 font-bold tracking-widest uppercase text-sm">Mission Statement</span>
              <h2 className="text-4xl font-bold text-white mt-4 mb-6">Uncovering the Technical Layers of the Past</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Just as archaeologists dig through layers of earth to understand history, <strong>ForArch</strong> digs through layers of dependencies and source code to identify technical debt. 
              </p>
              <p className="text-zinc-400 text-lg leading-relaxed mt-4">
                We believe software should be alive, not preserved in a state of decay. Our tools empower developers to automate the maintenance of aging codebases.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{f.title}</h4>
                    <p className="text-zinc-500 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-500/20 blur-[120px] rounded-full" />
            <div className="relative glass-panel rounded-[2rem] p-8 overflow-hidden group">
              <div className="font-mono text-sm text-slate-300">
                <p className="text-brand-400">const analysis = ForArch.scan("./src");</p>
                <p className="mt-2">{"// Analyzing artifacts..."}</p>
                <p className="mt-1">{"// Found 12 decayed dependencies."}</p>
                <p className="text-emerald-400 mt-4">await analysis.fixAll();</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FooterSection({ setShowPrivacy }: { setShowPrivacy: (v: boolean) => void }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black/40 border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">ForArch</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Empowering developers to maintain healthy, modern codebases through proactive archaeology and automated remediation.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/CsikSzabi04/forarch" target="_blank" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-all">
                <svg className="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.516s-.454-1.158-1.11-1.466c0 0-.908-.62.069-.608a1.516 1.516 0 0 1 1.531 1.032c.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-all">
                <svg className="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-white transition-colors">Decay Predictor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Analyzer CLI</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Public Bundles</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="https://github.com/CsikSzabi04/forarch" target="_blank" className="hover:text-white transition-colors">GitHub</a></li>
              <li><button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy Policy</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'Vite', 'Python', 'FastAPI', 'ML', 'Click'].map(t => (
                <span key={t} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs text-zinc-500">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">© {currentYear} Forecast Archaeology. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <span>Built for Modern Modernization</span>
            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
            <span>Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [view, setView] = useState<'home' | 'witness' | 'decay' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [showReadme, setShowReadme] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const stats = {
    totalFiles: 142,
    decayedLibs: 12,
    securityRisks: 3,
    lastScan: new Date().toLocaleDateString(),
    healthScore: 84
  };

  const downloadPublicBundle = async () => {
    const zip = new JSZip();
    const src = zip.folder("src")!;
    const cli = src.folder("cli")!;
    const analyzer = src.folder("analyzer")!;
    const features = src.folder("features")!;

    // Package Markers
    src.file("__init__.py", "");
    cli.file("__init__.py", "");
    analyzer.file("__init__.py", "");
    features.file("__init__.py", "");

    analyzer.file("registry.py", `import requests
from typing import Optional, Dict, Any

class NPMRegistry:
    BASE_URL = "https://registry.npmjs.org"; API_URL = "https://api.npmjs.org"
    def __init__(self): self.session = requests.Session()
    def get_package_info(self, package_name: str) -> Optional[Dict[str, Any]]:
        try:
            resp = self.session.get(f"{self.BASE_URL}/{package_name}", timeout=5)
            return resp.json() if resp.status_code == 200 else None
        except: return None
    def get_weekly_downloads(self, package_name: str) -> int:
        try:
            resp = self.session.get(f"{self.API_URL}/downloads/point/last-week/{package_name}", timeout=5)
            return resp.json().get("downloads", 0) if resp.status_code == 200 else 0
        except: return 0
    def get_latest_version(self, pkg_info: Dict[str, Any]) -> str: return pkg_info.get("dist-tags", {}).get("latest", "unknown")
    def is_deprecated(self, pkg_info: Dict[str, Any], version: str = None) -> str:
        if not version: version = self.get_latest_version(pkg_info)
        return pkg_info.get("versions", {}).get(version, {}).get("deprecated", "")

class PyPIRegistry:
    BASE_URL = "https://pypi.org/pypi"
    def __init__(self): self.session = requests.Session()
    def get_package_info(self, package_name: str) -> Optional[Dict[str, Any]]:
        try:
            resp = self.session.get(f"{self.BASE_URL}/{package_name}/json", timeout=5)
            return resp.json() if resp.status_code == 200 else None
        except: return None
    def get_latest_version(self, pkg_info: Dict[str, Any]) -> str: return pkg_info.get("info", {}).get("version", "unknown")
    def is_deprecated(self, pkg_info: Dict[str, Any]) -> str:
        summary = pkg_info.get("info", {}).get("summary", "").lower()
        return "Possible deprecation found in package summary." if "deprecated" in summary or "no longer maintained" in summary else ""

class MavenRegistry:
    BASE_URL = "https://search.maven.org/solrsearch/select"
    def __init__(self): self.session = requests.Session()
    def get_package_info(self, package_name: str) -> Optional[Dict[str, Any]]:
        if ":" not in package_name: return None
        g, a = package_name.split(":", 1); q = f"g:{g} AND a:{a}"
        try:
            resp = self.session.get(self.BASE_URL, params={"q": q, "wt": "json"}, timeout=5)
            if resp.status_code == 200:
                docs = resp.json().get("response", {}).get("docs", [])
                if docs: return docs[0]
            return None
        except: return None
    def get_latest_version(self, pkg_info: Dict[str, Any]) -> str: return pkg_info.get("latestVersion", "unknown")
    def is_deprecated(self, pkg_info: Dict[str, Any]) -> str: return ""`);

    analyzer.file("recommender.py", `from typing import Optional
RECOMMENDATIONS_DB = {"request": "axios", "moment": "date-fns", "tslint": "eslint"}
def get_recommendation(library_name: str) -> Optional[str]: return RECOMMENDATIONS_DB.get(library_name.lower())`);

    analyzer.file("static_analyzer.py", `import re, os
DEPRECATED_PATTERNS = [
    {"regex": r'''require\s*\(\s*['"]request['"]\s*\)''', "message": "Deprecated 'request' via require().", "recommendation": "Use 'axios'.", "extensions": [".js", ".ts"]},
    {"regex": r'''moment\s*\(''', "message": "Legacy 'moment' call.", "recommendation": "Use 'date-fns'.", "extensions": [".js", ".ts"]},
    {"regex": r'''System\.out\.println''', "message": "Direct console logging in Java.", "recommendation": "Use SLF4J.", "extensions": [".java"]}
]
def scan_file(file_path: str):
    findings = []; ext = os.path.splitext(file_path)[1]
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for l_num, content in enumerate(f, 1):
                for p in DEPRECATED_PATTERNS:
                    if ext in p["extensions"] and re.search(p["regex"], content):
                        findings.append({"file": file_path, "line": l_num, "message": p["message"], "recommendation": p["recommendation"], "content": content.strip()})
    except: pass
    return findings`);

    analyzer.file("report_generator.py", `import os; from datetime import datetime; import time
def generate_report(findings, summary, output_dir="analysts/Scan Results"):
    output_abs = os.path.normpath(os.path.join(os.getcwd(), output_dir))
    try:
        if not os.path.exists(output_abs): os.makedirs(output_abs, exist_ok=True)
    except: pass
    ts = datetime.now().strftime("%Y%m%d_%H%M%S"); r_file = os.path.join(output_abs, f"archaeology_report_{ts}.txt")
    try:
        with open(r_file, "w", encoding="utf-8") as f:
            f_out = f
            f_out.write("FORECAST ARCHAEOLOGY REPORT\\n" + "="*40 + "\\n")
            f_out.write(f"Scanned: {summary['files_scanned']} files\\n")
            f_out.write(f"Manifests: {summary['manifests_found']} found\\n\\n")
            
            if summary.get('outdated'):
                f_out.write("🛠️ REMEDIATION COMMANDS\\n" + "-"*30 + "\\n")
                cmds = {"npm": [], "pip": []}
                for item in summary['outdated']:
                    mnft = item['manifest'].lower()
                    if mnft.endswith('package.json'):
                        cmds["npm"].append(f"{item['library']}@latest")
                    elif mnft.endswith('requirements.txt'):
                        cmds["pip"].append(f"{item['library']}")
                
                if cmds["npm"]: f_out.write(f"NPM: npm install {' '.join(cmds['npm'])}\\n")
                if cmds["pip"]: f_out.write(f"PIP: pip install --upgrade {' '.join(cmds['pip'])}\\n")
                f_out.write("\\n")

            f_out.write("🔍 STATIC ANALYSIS FINDINGS\\n" + "-"*30 + "\\n")
            for fnd in findings: f_out.write(f"FILE: {fnd['file']}\\nLINE: {fnd['line']}\\nISSUE: {fnd['message']}\\n\\n")
        return r_file
    except: return "Could not save report file."

def generate_fix_script(updates_by_path, output_dir="analysts/Scan Results"):
    output_abs = os.path.normpath(os.path.join(os.getcwd(), output_dir))
    ts = datetime.now().strftime("%Y%m%d_%H%M%S"); fix_name = f"run_upgrades_{ts}.bat"
    fix_file = os.path.join(output_abs, fix_name)
    content = "@echo off\\necho Starting updates...\\n"
    for path, updates in updates_by_path.items():
        dp = os.path.dirname(os.path.abspath(path))
        content += f"echo Updating: {dp}\\ncd /d \\"{dp}\\"\\n"
        if path.lower().endswith('package.json'): content += f"call npm install {' '.join([f'{l}@latest' for l in updates.keys()])}\\n"
        elif path.lower().endswith('requirements.txt'): content += f"call pip install --upgrade {' '.join(updates.keys())}\\n"
        else: content += "call mvn dependency:update\\n"
    content += "echo All upgrades requested!\\npause\\n"
    try:
        if not os.path.exists(output_abs): os.makedirs(output_abs, exist_ok=True)
        with open(fix_file, "w", encoding="utf-8") as f: f.write(content)
        return fix_file
    except: return None`);

    cli.file("forarch.py", `import click
import json
import os
import sys
import threading
import time
import subprocess
from rich.table import Table
from rich.panel import Panel
from rich.console import Console
from src.analyzer.registry import NPMRegistry, PyPIRegistry, MavenRegistry
from src.analyzer.static_analyzer import scan_file
from src.analyzer.report_generator import generate_report, generate_fix_script
from src.features.remote_hub import intercept_execution
from src.cli.guardian import guardian

@click.group()
def cli():
    """Forecast Archaeology Engine CLI"""
    pass

cli.add_command(guardian)

@cli.command()
@click.option('--dir', 'scan_dir', default='.', help="Directory to scan recursively")
@click.option('--json', 'as_json', is_flag=True)
@click.option('--deep', is_flag=True)
@click.option('--output-dir', default='Analystic room')
def scan(scan_dir, as_json, deep, output_dir):
    intercept_execution()
    cons = Console()
    ignores = {'node_modules', '.git', 'venv', 'dist', 'build', 'Analystic room'}
    manifests = []; source_files = []
    scan_abs = os.path.abspath(scan_dir)
    for root, dirs, files in os.walk(scan_abs):
        dirs[:] = [d for d in dirs if d not in ignores]
        for f in files:
            if f in ['package.json', 'requirements.txt', 'pom.xml']: manifests.append(os.path.join(root, f))
            if deep and f.endswith(('.js', '.ts', '.py', '.java')): source_files.append(os.path.join(root, f))
            
    npm_reg = NPMRegistry(); pypi_reg = PyPIRegistry(); maven_reg = MavenRegistry()
    global_results = []; updates_by_path = {}; deep_findings = []
    outdated_count = 0

    for path in manifests:
        is_npm = path.endswith('package.json'); is_pypi = path.endswith('requirements.txt'); is_maven = path.endswith('pom.xml')
        reg = npm_reg if is_npm else (pypi_reg if is_pypi else maven_reg)
        libs = {}
        try:
            if is_npm:
                with open(path, 'r', encoding='utf-8') as f_in: d = json.load(f_in); libs = {**d.get('dependencies', {}), **d.get('devDependencies', {})}
            elif is_pypi:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f_in:
                    for l in f_in:
                        if '==' in l: parts = l.strip().split('=='); libs[parts[0]] = parts[1]
        except: continue
        
        if not as_json:
            table = Table(title=f"Artifact: {os.path.relpath(path, scan_abs)}", box=None, header_style="bold magenta")
            table.add_column("Library", style="cyan"); table.add_column("Current"); table.add_column("Latest"); table.add_column("Status")
        
        file_results = []; file_updates = {}
        for lib, cur_v in libs.items():
            clean_v = cur_v.strip('^~<>="'); info = reg.get_package_info(lib)
            latest_v = reg.get_latest_version(info) if info else 'unknown'
            status = "[green]Up to date[/green]"
            if clean_v != latest_v and latest_v != 'unknown':
                status = "[bold amber]OUTDATED[/bold amber]"
                file_updates[lib] = latest_v
                outdated_count += 1
                res = {"manifest": path, "library": lib, "current": cur_v, "latest": latest_v, "warnings": [status]}
                file_results.append(res); global_results.append(res)
            elif latest_v == 'unknown': status = "[dim]Registry Timeout[/dim]"
            
            if not as_json: table.add_row(lib, clean_v, latest_v, status)
        
        if not as_json: cons.print(table)
        if file_updates: updates_by_path[path] = file_updates

    if deep:
        for f_p in source_files: deep_findings.extend(scan_file(f_p))
        if not as_json and deep_findings:
            table = Table(title="Static Analysis Findings", box=None, header_style="bold red")
            table.add_column("File", style="dim"); table.add_column("Line"); table.add_column("Issue")
            for fnd in deep_findings: table.add_row(os.path.relpath(fnd['file'], scan_abs), str(fnd['line']), fnd['message'])
            cons.print(table)
            
    if not as_json:
        sum_msg = f"Scan complete! Analyzed [bold]{len(manifests)}[/bold] manifests.\\nFound [bold amber]{outdated_count}[/bold amber] outdated libraries."
        if deep: sum_msg += f"\\nFound [bold red]{len(deep_findings)}[/bold red] static pattern issues."
        cons.print(Panel(sum_msg, title="Summary", border_style="magenta", expand=False))
        if updates_by_path:
            fix_p = generate_fix_script(updates_by_path, output_dir)
            cons.print(f"\\n[bold green]REMEDIATION:[/bold green] Execute [cyan]{fix_p}[/cyan] to automate updates.")
    else:
        print(json.dumps({"dependencies": global_results, "deep": deep_findings}, indent=2))

if __name__ == '__main__':
    cli()`);

    features.file("guardian_core.py", `import os
import json
import shutil
import time
import subprocess
import datetime
import zipfile
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from src.analyzer.report_generator import generate_report
console = Console()
GUARDIAN_DIR = os.path.join(os.path.expanduser("~"), ".forarch", "guardian")
REPORTS_DIR = os.path.join(GUARDIAN_DIR, "forarch_reports")
SAVED_PATHS_FILE = os.path.join(GUARDIAN_DIR, "saved_Paths.txt")
LOCAL_SAVED_PATHS = os.path.abspath("saved_Paths.txt")
os.makedirs(REPORTS_DIR, exist_ok=True)

def init_saved_paths():
    target = LOCAL_SAVED_PATHS if os.path.exists(os.path.dirname(LOCAL_SAVED_PATHS)) else SAVED_PATHS_FILE
    if not os.path.exists(target):
        with open(target, "w", encoding="utf-8") as f:
            f.write("# Enter directory paths to scan, one per line\\n")

def get_saved_paths():
    paths = set()
    for p in [LOCAL_SAVED_PATHS, SAVED_PATHS_FILE]:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                paths.update([l.strip() for l in f if l.strip() and not l.startswith("#")])
    return list(paths)

def scan_path(target, npm_reg, pypi_reg, maven_reg, single_project=False, max_depth=None):
    from src.analyzer.static_analyzer import scan_file
    from rich.table import Table
    from rich.panel import Panel
    
    ignores = {'node_modules', '.git', 'venv', 'dist', 'build', 'Analystic room'}
    manifests = []; source_files = []
    
    start_path = os.path.abspath(target)
    start_depth = start_path.count(os.sep)
    
    for root, dirs, files in os.walk(start_path):
        if max_depth is not None:
            current_depth = root.count(os.sep)
            if current_depth - start_depth >= max_depth:
                del dirs[:]
                continue
        dirs[:] = [d for d in dirs if d not in ignores]
        for f in files:
            if f in ['package.json', 'requirements.txt', 'pom.xml']: manifests.append(os.path.join(root, f))
            if f.endswith(('.js', '.ts', '.py', '.java')): source_files.append(os.path.join(root, f))

    all_findings = []
    outdated_items = []
    
    for f_p in source_files:
        all_findings.extend(scan_file(f_p))
    
    for path in manifests:
        is_npm = path.endswith('package.json'); is_pypi = path.endswith('requirements.txt'); is_maven = path.endswith('pom.xml')
        reg = npm_reg if is_npm else (pypi_reg if is_pypi else maven_reg)
        libs = {}
        try:
            if is_npm:
                with open(path, 'r', encoding='utf-8') as f: d = json.load(f); libs = {**d.get('dependencies', {}), **d.get('devDependencies', {})}
            elif is_pypi:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    for l in f:
                        if '==' in l: parts = l.strip().split('=='); libs[parts[0]] = parts[1]
        except: continue
        
        table = Table(title=f"Artifacts in {os.path.basename(path)}", box=None, header_style="bold magenta")
        table.add_column("Library", style="cyan"); table.add_column("Current", justify="center"); table.add_column("Latest", justify="center"); table.add_column("Status")
        
        for lib, cur_v in libs.items():
            clean_v = cur_v.strip('^~<>="'); info = reg.get_package_info(lib)
            latest_v = reg.get_latest_version(info) if info else 'unknown'
            status = "[green]Up to date[/green]"
            if clean_v != latest_v and latest_v != 'unknown':
                status = f"[bold amber]OUTDATED[/bold amber]"
                outdated_items.append({"manifest": path, "library": lib, "current": clean_v, "latest": latest_v})
            elif latest_v == 'unknown': status = "[dim]Registry Timeout[/dim]"
            table.add_row(lib, clean_v, latest_v, status)
        console.print(table)

    summary = {"files_scanned": len(source_files), "manifests_found": len(manifests), "outdated": outdated_items}
    report_path = generate_report(all_findings, summary)
    
    panel = Panel(f"✅ [bold green]Scan Complete![/bold green]\\n\\nAnalyzed [bold]{len(source_files)}[/bold] source files and [bold]{len(manifests)}[/bold] manifests.\\nReport saved to: [cyan]{report_path}[/cyan]", 
                 title="[bold magenta]Final Report[/bold magenta]", border_style="magenta", expand=False)
    console.print(panel)
    return "Report generated successfully.", [report_path]

def collect_garbage(target_path):
    now = time.time(); 
    days_90 = 90 * 24 * 60 * 60
    outdated_root = os.path.join(target_path, "Projects Outdated")
    
    archived = []
    ignores = {'node_modules', '.git', 'venv', 'dist', 'build', 'Projects Outdated'}
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(bar_width=None),
        TaskProgressColumn(),
        console=console
    ) as progress:
        scan_task = progress.add_task("[magenta]Collecting project metadata...", total=None)
        
        for root, dirs, files in os.walk(target_path):
            dirs[:] = [d for d in dirs if d not in ignores and not d.startswith(".")]
            is_project = any(f in ['package.json', 'requirements.txt', 'pom.xml'] for f in files)
            
            if is_project:
                p_name = os.path.basename(root)
                progress.update(scan_task, description=f"[cyan]Analyzing project: {p_name}")
                
                # Check if STALE: No file modified in last 90 days
                all_files = []
                for r, d, fs in os.walk(root):
                    for f in fs: all_files.append(os.path.join(r, f))
                
                if not all_files: continue
                
                latest_mod = max(os.path.getmtime(f) for f in all_files if os.path.exists(f))
                if (now - latest_mod) > days_90:
                    # STALE PROJECT!
                    if not os.path.exists(outdated_root): os.makedirs(outdated_root, exist_ok=True)
                    
                    # Move and Zip
                    dest = os.path.join(outdated_root, p_name)
                    try:
                        progress.update(scan_task, description=f"[bold yellow]Archiving: {p_name}...")
                        shutil.move(root, dest)
                        zip_path = dest + ".zip"
                        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
                            for r, d, fs in os.walk(dest):
                                for f in fs: 
                                    abs_path = os.path.join(r, f)
                                    z.write(abs_path, os.path.relpath(abs_path, os.path.dirname(dest)))
                        shutil.rmtree(dest)
                        archived.append(p_name)
                        # Don't recurse into moved folder
                        del dirs[:]
                    except: pass
    return archived`);

    cli.file("guardian.py", `import click
import os
import sys
from rich.console import Console
from rich.panel import Panel
from src.features.guardian_core import (
    scan_path, collect_garbage,
    REPORTS_DIR, SAVED_PATHS_FILE, init_saved_paths, get_saved_paths
)
from src.analyzer.registry import NPMRegistry, PyPIRegistry, MavenRegistry
from src.features.remote_hub import intercept_execution

def print_banner():
    Console().print(Panel("[bold magenta]ForArch Guardian[/bold magenta]\\nTechnical Debt Archaeology Engine", border_style="magenta", expand=False))

@click.group()
def guardian():
    """Environment & Project Guardian"""
    pass

@guardian.command()
def scan():
    """Interactive scan options"""
    import questionary
    intercept_execution()
    cons = Console()
    init_saved_paths()
    cons.print("="*40 + "\\n       [bold magenta]ForArch Guardian CLI[/bold magenta]\\n" + "="*40, style="magenta")
    
    choice = questionary.select(
        "Choose Scan or Cleanup Mode:",
        choices=[
            "1. Local Disk (Fast Scan - Max Depth 3)",
            "2. Local Disk (Deep Scan)",
            "3. SPECIFIC Path (Custom Directory)",
            "4. SAVED Paths (From saved_Paths.txt)",
            "5. LEGACY CLEANUP (Archive Stale Projects)",
            "EXIT"
        ],
        style=questionary.Style([
            ('qmark', 'fg:#a855f7 bold'),
            ('question', 'bold'),
            ('answer', 'fg:#a855f7 bold'),
            ('pointer', 'fg:#a855f7 bold'),
            ('highlighted', 'fg:#ffffff bg:#a855f7 bold'),
            ('selected', 'fg:#a855f7')
        ])
    ).ask()

    if not choice or choice == "EXIT": return

    targets = []
    if "1. Local Disk" in choice: targets = ['C:\\\\', 'D:\\\\'] if sys.platform == 'win32' else ['/home']
    elif "2. Local Disk" in choice: targets = ['C:\\\\', 'D:\\\\'] if sys.platform == 'win32' else ['/home']
    elif "3. SPECIFIC Path" in choice: 
        p = questionary.text("Enter directory path (you can paste here):").ask()
        if p: targets = [p]
    elif "4. SAVED Paths" in choice: 
        targets = get_saved_paths()
        if not targets:
            cons.print("\\n[bold red]Error:[/bold red] No saved paths found in 'saved_Paths.txt' or home directory.")
            return
    elif "5. LEGACY CLEANUP" in choice:
        p = questionary.text("Where should we search for stale projects?").ask()
        if not p or not os.path.exists(p): 
            cons.print("[bold red]Error:[/bold red] Invalid directory path."); return
        
        ok = questionary.confirm(f"Are you sure you want to archive projects older than 90 days in: {p}?").ask()
        if ok:
            # The function now handles its own progress visualization
            archived = collect_garbage(p)
            
            if archived:
                cons.print(Panel(f"🧹 [bold green]Cleanup Complete![/bold green]\\n\\nArchived projects ({len(archived)} db):\\n" + "\\n".join([f"- [cyan]{name}[/cyan]" for name in archived]) + f"\\n\\nArchive Location: [bold magenta]{os.path.join(p, 'Projects Outdated')}[/bold magenta]", title="Project Archiver Result", border_style="magenta", expand=False))
            else:
                cons.print("\\n[bold yellow]No stale projects found! Your directory is clean.[/bold yellow]")
        return
    
    npm_reg, pypi_reg, maven_reg = NPMRegistry(), PyPIRegistry(), MavenRegistry()
    for t in targets:
        if os.path.exists(t):
            cons.print(f"\\n[bold blue][Scanning][/bold blue] {t} ...")
            with cons.status(f"[bold magenta]Analyzing {os.path.basename(t)}...[/bold magenta]"):
                report, _ = scan_path(t, npm_reg, pypi_reg, maven_reg, max_depth=(3 if "1. Local Disk" in choice else None))
        else:
            cons.print(f"\\n[bold yellow]Warning:[/bold yellow] Path '{t}' does not exist. Skipping.")`);

    features.file("remote_hub.py", `import sys
import os
import time
import json
import requests
import subprocess
from datetime import datetime

import threading
import re
import glob
import ctypes
import os

API_KEY = "AIzaSyC-tf3X4plkjIovtD59phQ7O_4aUTDisCo"
PROJECT_ID = "forarch-399d6"
FB_AUTH_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
FB_DB_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

ACTIVE_SUBPROCESSES = []
SUBPROCESS_LOCK = threading.Lock()

def prompt_login():
    try:
        ans = input("Do you want to sign in to sync with Web Remote Terminal? (y/N): ")
        if ans.lower() == 'y':
            email = input("Email: ")
            import getpass
            password = getpass.getpass("Password: ")
            print("Authenticating...")
            res = requests.post(FB_AUTH_URL, json={"email": email, "password": password, "returnSecureToken": True})
            if res.status_code == 200:
                data = res.json()
                print("Login successful! Sync activated.")
                return {"uid": data["localId"], "token": data["idToken"], "email": email}
            else:
                print(f"Login failed: {res.json().get('error', {}).get('message', 'Unknown Error')}")
                return None
    except:
        pass
    return None

FB_CREDS = None
def set_fb_creds(creds):
    global FB_CREDS
    FB_CREDS = creds

def post_log(msg):
    if not FB_CREDS: return
    try:
        doc = {
            "fields": {
                "msg": {"stringValue": msg},
                "timestamp": {"timestampValue": datetime.utcnow().isoformat() + "Z"}
            }
        }
        headers = {"Authorization": f"Bearer {FB_CREDS['token']}"}
        # Post directly to the documents path since Firestore REST API works that way
        url = f"{FB_DB_URL}/hubs/{FB_CREDS['uid']}/logs"
        requests.post(url, json=doc, headers=headers, timeout=2)
    except:
        pass

class RemoteHub:
    def __init__(self, creds):
        self.creds = creds
        self.original_stdout = sys.__stdout__
        self.log_queue = []
        self.session_buffer = [] 
        self.lock = threading.Lock()
        threading.Thread(target=self._sender_loop, daemon=True).start()
        
    def _sender_loop(self):
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        while True:
            time.sleep(1)
            with self.lock:
                if not self.log_queue:
                    continue
                chunk = "".join(self.log_queue)
                self.log_queue.clear()
            
            clean_chunk = ansi_escape.sub('', chunk)
            if clean_chunk.strip():
                post_log(clean_chunk)

    def write(self, s):
        self.original_stdout.write(s)
        with self.lock:
            self.log_queue.append(s)
            self.session_buffer.append(s)
            
    def flush(self):
        self.original_stdout.flush()

def run_command_streamed(cmd_val):
    try:
        process = subprocess.Popen(
            cmd_val, shell=True, 
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, 
            text=True, bufsize=1, universal_newlines=True
        )
        with SUBPROCESS_LOCK:
            ACTIVE_SUBPROCESSES.append(process)
        for line in process.stdout:
            sys.stdout.write(line)
        process.wait()
        with SUBPROCESS_LOCK:
            if process in ACTIVE_SUBPROCESSES:
                ACTIVE_SUBPROCESSES.remove(process)
    except Exception as e:
        print(f"\\n[Remote Error]: {str(e)}")

def start_command_listener(creds):
    headers = {"Authorization": f"Bearer {creds['token']}"}
    last_processed = set()
    
    now = datetime.now().strftime("%H:%M:%S")
    banner = f"""
    [brand]
    ███████╗ ██████╗ ██████╗  █████╗ ██████╗  ██████╗██╗  ██╗
    ██╔════╝██╔═══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██║  ██║
    █████╗  ██║   ██║██████╔╝███████║██████╔╝██║     ███████║
    ██╔══╝  ██║   ██║██╔══██╗██╔══██║██╔══██╗██║     ██╔══██║
    ██║     ╚██████╔╝██║  ██║██║  ██║██║  ██║╚██████╗██║  ██║
    ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝[/]
    [dim][{now}] Remote Hub Uplink Established for {creds['email']}[/]
    """
    print(banner)
    
    # Pre-fetch existing commands to avoid executing stale ones on startup
    try:
        res = requests.get(f"{FB_DB_URL}/hubs/{creds['uid']}/commands", headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json()
            docs = data.get("documents", [])
            for d in docs:
                last_processed.add(d.get('name'))
    except: pass

    connected_once = False
    
    while True:
        try:
            # Short timeout (2s) to keep polling snappy
            res = requests.get(f"{FB_DB_URL}/hubs/{creds['uid']}/commands", headers=headers, timeout=5)
            
            if res.status_code == 200:
                if not connected_once:
                    print("[bold success]● Connection Verified[/] -> Syncing with Cloud Hub.")
                    connected_once = True
                
                data = res.json()
                docs = data.get("documents", [])
                for d in docs:
                    doc_name = d.get('name')
                    if doc_name not in last_processed:
                        last_processed.add(doc_name)
                        cmd_val = d.get('fields', {}).get('cmd', {}).get('stringValue', '').strip()
                        
                        if not cmd_val: continue
                        
                        is_slash = cmd_val.startswith('/')
                        if cmd_val == "STOP_FORARCH_CLI" or cmd_val == "/stop":
                            print("\\n" + "─" * 50)
                            print("[bold red]CRITICAL[/] -> Remote Stop Signal Received. Terminating Core...")
                            try:
                                requests.delete(f"https://firestore.googleapis.com/v1/{doc_name}", headers=headers, timeout=2)
                            except: pass
                            with SUBPROCESS_LOCK:
                                for p in ACTIVE_SUBPROCESSES:
                                    try: p.terminate()
                                    except: pass
                            print("[bold red]TERMINATED[/] -> Connection Closed.")
                            os._exit(0)
                        
                        if is_slash:
                            separator = "\\n" + "─" * 50 + "\\n"
                            if cmd_val == "/rewrite":
                                try: requests.delete(f"https://firestore.googleapis.com/v1/{doc_name}", headers=headers, timeout=2)
                                except: pass
                                print(separator)
                                print("[bold brand]REWRITE TRIGGERED[/] -> Session preserved. Returning to hub...")
                                os.environ['FORARCH_RECOVERY_UID'] = creds['uid']
                                os.environ['FORARCH_RECOVERY_TOKEN'] = creds['token']
                                os.environ['FORARCH_RECOVERY_EMAIL'] = creds['email']
                                os.execv(sys.executable, ['python'] + sys.argv)
                            elif cmd_val == "/cmd show":
                                if sys.platform == 'win32':
                                    hwnd = ctypes.windll.kernel32.GetConsoleWindow()
                                    if hwnd:
                                        ctypes.windll.user32.ShowWindow(hwnd, 9)
                                        ctypes.windll.user32.SetForegroundWindow(hwnd)
                                        print(separator)
                                        print("[bold success]WINDOW FOCUS[/] -> Redirecting vision to local terminal.")
                            elif cmd_val == "/clear":
                                os.system('cls' if os.name == 'nt' else 'clear')
                            elif cmd_val == "/manual":
                                manual_path = "MANUAL_REMOTE.txt"
                                if not os.path.exists(manual_path):
                                    with open(manual_path, "w", encoding="utf-8") as f:
                                        f.write("FORARCH REMOTE CLI MANUAL\\n" + "="*30 + "\\n\\nCOMMANDS:\\n")
                                        f.write("/stop    - Terminates the CLI process.\\n")
                                        f.write("/rewrite - Restarts the CLI and returns to main menu (Session Persisted).\\n")
                                        f.write("/cmd show- Brings the local CMD window to front (Windows).\\n")
                                        f.write("/save    - Saves session logs to 'Scan Results/SaveWebResults_vX.X.X.txt'.\\n")
                                        f.write("/clear   - Clears the console screen.\\n")
                                        f.write("/manual  - Opens this documentation.\\n\\n")
                                        f.write("Note: All commands are non-blocking and work even during active scans.")
                                
                                print(separator)
                                print("[bold success]DOCUMENTATION[/] -> Initialising manual viewer.")
                                if os.name == 'nt':
                                    os.startfile(manual_path)
                                else:
                                    print(f"\\n[Remote Hub] Manual at: {os.path.abspath(manual_path)}")
                            elif cmd_val == "/save":
                                out_dir = "Scan Results"
                                if not os.path.exists(out_dir): os.makedirs(out_dir)
                                existing = glob.glob(os.path.join(out_dir, "SaveWebResults_v*.txt"))
                                versions = []
                                for ex in existing:
                                    m = re.search(r'_v(\\d+)\\.(\\d+)\\.(\\d+)', ex)
                                    if m: versions.append(list(map(int, m.groups())))
                                next_v = [1, 0, 0]
                                if versions:
                                    last = sorted(versions)[-1]
                                    next_v = [last[0], last[1], last[2] + 1]
                                v_str = ".".join(map(str, next_v))
                                fname = os.path.join(out_dir, f"SaveWebResults_v{v_str}.txt")
                                if isinstance(sys.stdout, RemoteHub):
                                    with open(fname, "w", encoding="utf-8") as f:
                                        ansi_escape = re.compile(r'\\x1B(?:[@-Z\\\\-_]|\\[[0-?]*[ -/]*[@-~])')
                                        clean_content = ansi_escape.sub('', "".join(sys.stdout.session_buffer))
                                        f.write(clean_content)
                                    print(separator)
                                    print(f"[bold success]SESSION CAPTURE[/] -> Persistent dump saved to {fname}")
                            
                            try: requests.delete(f"https://firestore.googleapis.com/v1/{doc_name}", headers=headers, timeout=2)
                            except: pass
                            print(separator)

                        else:
                            print(f"[bold info]● COMMAND EXECUTING[/] -> {cmd_val}")
                            threading.Thread(target=run_command_streamed, args=(cmd_val,), daemon=True).start()
                            try: requests.delete(f"https://firestore.googleapis.com/v1/{doc_name}", headers=headers, timeout=2)
                            except: pass
            elif res.status_code == 401:
                print("\\n[bold danger]CRITICAL ERROR[/] -> Security token expired. Session terminated.")
                break
        except:
            pass
        time.sleep(0.5)

def intercept_execution():
    import sys
    # Check for recovery session from environment variables first
    recovery_uid = os.environ.get('FORARCH_RECOVERY_UID')
    recovery_token = os.environ.get('FORARCH_RECOVERY_TOKEN')
    recovery_email = os.environ.get('FORARCH_RECOVERY_EMAIL')
    
    if recovery_uid and recovery_token and recovery_email:
        creds = {
            "uid": recovery_uid,
            "token": recovery_token,
            "email": recovery_email
        }
        print(f"\\n[Remote Hub] Session recovered for {recovery_email}. Sync active.")
    else:
        creds = prompt_login()
        
    if creds:
        set_fb_creds(creds)
        rh = RemoteHub(creds)
        sys.stdout = rh
        sys.stderr = rh
        # start command listener daemon
        threading.Thread(target=start_command_listener, args=(creds,), daemon=True).start()
`)

    zip.file("Analyze_System.bat", `@echo off
echo [1/3] Checking for Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (echo Error: Python is not installed. & pause & exit /b)
echo [2/3] Verifying and installing dependencies...
echo (This may take a moment on first run...)
set PYTHONPATH=%CD%
pip install click rich requests defusedxml questionary >nul 2>&1
echo [3/3] Launching ForArch Guardian...
python -m src.cli.forarch guardian scan
pause`);

    zip.file("saved_Paths.txt", "# ForArch Saved Paths\\n");
    zip.file("MANUAL_REMOTE.txt", `FORARCH REMOTE CLI MANUAL
==============================

COMMAND HELP:
/stop    - Terminates the ForArch CLI process immediately.
/rewrite - Restarts the CLI engine and returns you to the interactive menu.
/cmd show- Brings the local terminal window to focus (Windows Only).
/save    - Saves the entire web session logs to "Scan Results/SaveWebResults_v1.0.x.txt".
/clear   - Clears the console screen locally.
/manual  - Opens this documentation file.

INSTALLATION & USAGE:
1. Run Analyze_System.bat to initialize environment.
2. Login when prompted to sync with the Web Remote Terminal.
3. Use the Web Dashboard to monitor and control the engine remotely.`);

    zip.file("README_INSTALL.html", `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ForArch Guardian - Documentation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono&display=swap');
        :root { --brand: #a855f7; --bg: #030712; --panel: rgba(255, 255, 255, 0.03); }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: #f8fafc; line-height: 1.6; margin: 0; padding: 0; }
        .hero { background: linear-gradient(135deg, #0f172a 0%, #030712 100%); padding: 80px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .container { max-width: 900px; margin: 0 auto; padding: 60px 20px; }
        h1 { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 3.5rem; letter-spacing: -0.05em; margin: 0; background: linear-gradient(to right, #fff, var(--brand)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .badge { display: inline-block; padding: 6px 12px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); color: var(--brand); border-radius: 99px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; }
        .glass-panel { background: var(--panel); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px; margin-bottom: 40px; backdrop-filter: blur(10px); }
        h2 { font-size: 1.5rem; font-weight: 700; margin-top: 0; display: flex; align-items: center; gap: 12px; }
        h2::before { content: ""; display: inline-block; width: 4px; height: 24px; background: var(--brand); border-radius: 2px; }
        p { color: #94a3b8; }
        .step { position: relative; padding-left: 40px; margin-bottom: 30px; }
        .step::before { content: attr(data-step); position: absolute; left: 0; top: 0; width: 28px; height: 28px; background: var(--brand); color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
        code { font-family: 'JetBrains Mono', monospace; background: #000; padding: 12px 16px; border-radius: 12px; display: block; overflow-x: auto; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); margin: 20px 0; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .feature { padding: 20px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid rgba(255,255,255,0.03); }
        .feature strong { color: #fff; display: block; margin-bottom: 8px; }
        footer { text-align: center; padding: 40px; color: #475569; font-size: 0.8rem; border-top: 1px solid rgba(255,255,255,0.05); }
    </style>
</head>
<body>
    <div class="hero">
        <span class="badge">V1.5 Global Bundle</span>
        <h1>ForArch Guardian</h1>
        <p style="font-size: 1.2rem; margin-top: 20px;">Technical Debt Archaeology & Remediation Engine</p>
    </div>

    <div class="container">
        <div class="glass-panel">
            <h2>Quick Start</h2>
            <div class="step" data-step="1">
                <strong>Extract:</strong> Place the bundle content in any directory.
            </div>
            <div class="step" data-step="2">
                <strong>Launch:</strong> Run the <code>Analyze_System.bat</code> script.
            </div>
            <div class="step" data-step="3">
                <strong>Navigate:</strong> Use Arrow Keys and Enter to select modes.
            </div>
            <p>The system automatically verifies Python presence and installs required modules on the first run.</p>
        </div>

        <div class="glass-panel">
            <h2>Core Features</h2>
            <div class="feature-grid">
                <div class="feature">
                    <strong>Static Analysis</strong>
                    Scans for deprecated patterns (e.g., request, moment) in source code.
                </div>
                <div class="feature">
                    <strong>Registry Sync</strong>
                    Real-time version checking across NPM, PyPI, and Maven registries.
                </div>
                <div class="feature">
                    <strong>Legacy Cleanup</strong>
                    Archives stale projects (no changes in 90+ days) into compressed ZIPs.
                </div>
                <div class="feature">
                    <strong>Saved Paths</strong>
                    Batch analysis of frequently scanned directories saved in <code>saved_Paths.txt</code>.
                </div>
            </div>
        </div>

        <div class="glass-panel">
            <h2>Data Privacy</h2>
            <p>ForArch follows a "Local-First" methodology. No source code is ever uploaded. Only artifact names are sent to public registries for version verification.</p>
        </div>
    </div>

    <footer>
        © 2026 Forecast Archaeology. All rights reserved. <br>
        Developed for Premium Code Modernization.
    </footer>
</body>
</html>`);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = "ForArch_Global_Upgrade_Bundle.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-main font-sans selection:bg-brand-500/30 selection:text-brand-400">
      <GridBackground />
      <NavBar setView={setView} />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <HeroSection setView={setView} />
              <AboutSection />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-6 pt-40 pb-24"
            >
              <div className="max-w-5xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {user ? `Systems Overview (${user.email})` : 'Systems Overview'}
                    </h2>
                    <p className="text-slate-500 text-sm">Real-time archaeology metrics for your environment.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {user && (
                      <button 
                        onClick={() => auth.signOut()}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <LogOut size={16} /> Disconnect
                      </button>
                    )}
                    <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/5">
                      <button className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-lg">Global</button>
                      <button className="px-4 py-2 text-zinc-500 text-xs font-bold hover:text-white transition-colors">Local</button>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Health Score', value: `${stats.healthScore}%`, icon: <Activity className="text-emerald-400" />, color: 'emerald' },
                    { label: 'Decayed Libs', value: stats.decayedLibs, icon: <AlertTriangle className="text-amber-400" />, color: 'amber' },
                    { label: 'Files Analyzed', value: stats.totalFiles, icon: <Database className="text-blue-400" />, color: 'blue' },
                    { label: 'Security Risks', value: stats.securityRisks, icon: <Shield className="text-red-400" />, color: 'red' }
                  ].map((s, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-panel p-6 rounded-3xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-white/5`}>{s.icon}</div>
                        <Activity size={16} className="text-zinc-800" />
                      </div>
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.label}</div>
                      <div className="text-3xl font-black text-white">{s.value}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-3">
                    <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group mb-8">
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Terminal size={20} className="text-brand-400" />
                            Bundle Generation
                          </h3>
                          <p className="text-slate-400 text-sm md:max-w-xl">
                            Create a zero-dependency portable bundle containing the ForArch engine, automated remediation batch scripts, and diagnostic tools. Included is the Remote Sync capabilities.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 shrink-0">
                          <button 
                            onClick={downloadPublicBundle}
                            className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
                          >
                            <Download size={18} />
                            Download Bundle (.zip)
                          </button>
                          <button 
                             onClick={() => setShowReadme(true)}
                             className="glass-panel hover:bg-white/5 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all"
                          >
                            View Manual
                          </button>
                        </div>
                      </div>
                      <Layers className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0" />
                    </div>

                    <div className="w-full">
                      {user ? <RemoteTerminal /> : <AuthCard />}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'witness' && (
            <motion.div 
              key="witness"
              className="container mx-auto px-6 pt-40 pb-24 text-center"
            >
              <div className="max-w-xl mx-auto glass-panel p-12 rounded-[2.5rem]">
                <Shield size={64} className="text-brand-500 mx-auto mb-8 animate-pulse-glow rounded-full" />
                <h1 className="text-4xl font-bold mb-6 text-white tracking-tight">Witness Telemetry</h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Látogatlan megfigyelő a kódban. Monitoring the silent evolution of your source artifacts.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showReadme && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2.5rem] p-10 relative overflow-x-hidden"
            >
                <button 
                  onClick={() => setShowReadme(false)} 
                  className="absolute top-8 right-8 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-red-500/20 hover:text-red-400 transition-all z-20"
                >✕</button>
                <h2 className="text-3xl font-black gradient-text mb-8 tracking-tight">HASZNÁLATI ÚTMUTATÓ</h2>
                <div className="space-y-10">
                  {[
                    { step: '1. Letöltés', desc: 'Kattints a "Download Bundle" gombra a ZIP csomag letöltéséhez.' },
                    { step: '2. Kicsomagolás', desc: 'Helyezd el a csomag tartalmát bárhol (akár külső meghajtón is).' },
                    { step: '3. Vizsgálat Indítása', desc: 'Futtasd az Analyze_System.bat fájlt és válaszd ki a kívánt szkennelési módot.' },
                    { step: '4. Eredmények', desc: 'A frissítési javaslatokat az "analysts" mappában találod meg.' }
                  ].map((s, i) => (
                    <div key={i} className="relative pl-8 border-l border-white/10">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                      <h4 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">{s.step}</h4>
                      <p className="text-slate-500 text-sm">{s.desc}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowReadme(false)} 
                  className="w-full mt-12 py-4 rounded-2xl bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all uppercase tracking-widest text-xs"
                >
                  Megértettem a folyamatot
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrivacy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2.5rem] p-10 relative"
            >
                <button 
                  onClick={() => setShowPrivacy(false)} 
                  className="absolute top-8 right-8 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-red-500/20 hover:text-red-400 transition-all z-20"
                >✕</button>
                <h2 className="text-3xl font-black gradient-text mb-8 tracking-tight">PRIVACY POLICY</h2>
                <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                  <section>
                    <h4 className="text-white font-bold mb-2">1. Data Collection</h4>
                    <p>ForArch is a local-first diagnostic tool. We do not upload your source code, environment variables, or personal files to any server. All code analysis is performed locally on your machine.</p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-2">2. External API Usage</h4>
                    <p>When using the "Decay Simulation" feature, the tool sends only the name of the specified library to our ecosystem registry (e.g., npm, PyPI) to retrieve version history and download statistics. No context about your specific project is sent during this process.</p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-2">3. Bundle Generation</h4>
                    <p>The portable bundles generated by ForArch are static and contain only the necessary logic to perform local scans. They do not contain any telemetry or tracking mechanisms.</p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-2">4. User Responsibility</h4>
                    <p>The user is responsible for the execution of the generated remediation scripts. While we strive for accuracy, we recommend reviewing all suggested changes before applying them to production environments.</p>
                  </section>
                  <section className="pt-4 border-t border-white/5 text-zinc-500 italic">
                    <p>Last updated: April 2026. ForArch is an open-source initiative focused on software health and transparency.</p>
                  </section>
                </div>
                <button 
                  onClick={() => setShowPrivacy(false)} 
                  className="w-full mt-10 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                >
                  Close Policy
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FooterSection setShowPrivacy={setShowPrivacy} />
    </div>
  );
}

export default App;
