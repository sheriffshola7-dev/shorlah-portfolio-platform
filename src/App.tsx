import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, Check, ExternalLink, FileText, Instagram, Linkedin, Mail, Menu, Plus, Search, Send, ShieldCheck, Sparkles, X } from 'lucide-react'
import { isSupabaseConfigured, MEDIA_BUCKET, mediaUrl, supabase } from './lib/supabase'

type Profile = Record<string, any>
type Project = Record<string, any>
type Category = Record<string, any>

function usePortfolio() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    const [p, work, cats] = await Promise.all([
      supabase.from('profiles').select('*').eq('is_published', true).limit(1).maybeSingle(),
      supabase.from('projects').select('*, project_media(*), project_categories(category:categories(*)), testimonials(*)').eq('is_published', true).order('featured', { ascending: false }).order('sort_order'),
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    ])
    if (p.data) setProfile(p.data)
    if (work.data) setProjects(work.data)
    if (cats.data) setCategories(cats.data)
    setLoading(false)
  }

  useEffect(() => { void refresh() }, [])
  return { profile, projects, categories, loading, refresh }
}

function Brand() {
  return <Link to="/" className="brand"><span className="brand-mark">S<span>.</span></span><span>SHORLAH CLOUD<small>INDEPENDENT DIGITAL STUDIO</small></span></Link>
}

function Header({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false)
  return <header className="site-header"><div className="nav-wrap"><Brand /><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button><nav className={open ? 'nav-links nav-open' : 'nav-links'}><Link to="/" onClick={() => setOpen(false)}>Work</Link><Link to="/profile" onClick={() => setOpen(false)}>About</Link><Link to="/contact" onClick={() => setOpen(false)}>Contact</Link><Link className="nav-cta" to="/contact" onClick={() => setOpen(false)}>Start a project <ArrowUpRight size={15}/></Link></nav></div></header>
}

function Footer({ profile }: { profile: Profile | null }) {
  return <footer className="footer"><div><Brand /><p>Thoughtful digital work. Clear outcomes.</p></div><div className="footer-right"><span>© {new Date().getFullYear()} Shorlah Cloud</span><Link to="/admin">Admin</Link></div></footer>
}

function SocialLinks({ profile }: { profile: Profile | null }) {
  const socials = profile?.social_links || {}
  const entries = [{ key: 'linkedin', icon: Linkedin, label: 'LinkedIn' }, { key: 'instagram', icon: Instagram, label: 'Instagram' }, { key: 'website', icon: ExternalLink, label: 'Website' }]
  return <div className="socials">{entries.filter(x => socials[x.key]).map(x => <a key={x.key} href={socials[x.key]} target="_blank" rel="noreferrer" aria-label={x.label}><x.icon size={17}/></a>)}</div>
}

function ProjectCard({ project }: { project: Project }) {
  const cover = project.project_media?.find((m: any) => m.is_cover) || project.project_media?.[0]
  const cats = (project.project_categories || []).map((x: any) => x.category?.name).filter(Boolean)
  return <Link to={'/project/' + project.slug} className="project-card"><div className="project-image">{cover ? <img src={mediaUrl(cover.storage_path)} alt={cover.alt_text || project.title}/> : <div className="image-placeholder"><span>SHORLAH CLOUD</span><ArrowUpRight size={26}/></div>}<span className="card-arrow"><ArrowUpRight size={18}/></span></div><div className="project-meta"><div><span className="eyebrow">{cats[0] || 'SELECTED PROJECT'}</span><h3>{project.title}</h3><p>{project.summary}</p></div><ArrowUpRight className="project-link-icon" size={19}/></div></Link>
}

function Home() {
  const { profile, projects, categories, loading } = usePortfolio()
  const [active, setActive] = useState('All work')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => projects.filter(p => {
    const catMatch = active === 'All work' || (p.project_categories || []).some((x: any) => x.category?.name === active)
    const q = query.toLowerCase()
    return catMatch && (!q || [p.title, p.summary, p.description, ...(p.tags || [])].join(' ').toLowerCase().includes(q))
  }), [projects, active, query])

  return <><Header profile={profile}/><main>
    <section className="hero container"><div className="hero-copy"><div className="availability"><span className="live-dot"/> AVAILABLE FOR SELECT PROJECTS</div><p className="hero-kicker">A DIGITAL PORTFOLIO BY SHORLAH CLOUD</p><h1>Good work.<br/><em>Clear thinking.</em></h1><p className="hero-intro">{profile?.headline || 'Digital experiences, reputation work and practical automation — built around the problem that needs solving.'}</p><div className="hero-actions"><a className="button button-dark" href="#work">Explore selected work <ArrowDownRight size={17}/></a><Link className="text-link" to="/contact">Have a project in mind? <ArrowUpRight size={16}/></Link></div></div><div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className={profile?.profile_image_path ? "art-center has-profile-photo" : "art-center"}>{profile?.profile_image_path ? <img className="hero-profile-photo" src={mediaUrl(profile.profile_image_path)} alt={profile?.display_name || "Shorlah Cloud profile"}/> : <span>S</span>}<small>SC / 01</small></div><div className="art-label label-top">STRATEGY</div><div className="art-label label-bottom">EXECUTION <span>↗</span></div><div className="art-cross">+</div></div><div className="hero-index"><span>01 / PORTFOLIO</span><span>INDEPENDENT BY DESIGN</span></div></section>
    <section className="intro-strip"><div className="container intro-inner"><span className="eyebrow">THE APPROACH</span><p>From first idea to finished delivery, the focus stays on <strong>useful work that moves things forward.</strong></p><Link to="/profile" className="round-link"><ArrowUpRight/></Link></div></section>
    <section className="work-section container" id="work"><div className="section-heading"><div><span className="eyebrow">A FEW THINGS WE'VE WORKED ON</span><h2>Selected work<span className="green-dot">.</span></h2></div><p>Projects, experiments and outcomes.<br/>Each one has a story behind it.</p></div>
      <div className="filter-bar"><div className="filters"><button className={active === 'All work' ? 'filter active' : 'filter'} onClick={() => setActive('All work')}>All work <span>{projects.length}</span></button>{categories.map(c => <button key={c.id} className={active === c.name ? 'filter active' : 'filter'} onClick={() => setActive(c.name)}>{c.name}</button>)}</div><label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a project"/></label></div>
      {loading ? <div className="empty-state"><div className="loader"/><p>Loading selected work…</p></div> : !isSupabaseConfigured ? <div className="empty-state"><Sparkles/><h3>Portfolio connection needed</h3><p>Connect this site to the Shorlah Cloud Supabase project to publish work here.</p></div> : filtered.length ? <div className="project-grid">{filtered.map(p => <ProjectCard key={p.id} project={p}/>)}</div> : <div className="empty-state"><BriefcaseBusiness/><h3>{projects.length ? 'No matching projects yet' : 'The portfolio is being prepared'}</h3><p>{projects.length ? 'Try another category or search term.' : 'New case studies will appear here as they are published.'}</p></div>}
    </section>
    <section className="cta-band"><div className="container cta-inner"><span className="eyebrow">HAVE SOMETHING IN MIND?</span><h2>Let's make it<br/><em>worth remembering.</em></h2><Link to="/contact" className="button button-light">Tell us about it <ArrowUpRight size={17}/></Link><span className="cta-decoration">SC—26</span></div></section>
  </main><Footer profile={profile}/></>
}

function ProjectDetail() {
  const { slug } = useParams()
  const { profile, projects, loading } = usePortfolio()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const project = projects.find(p => p.slug === slug)
  if (loading) return <><Header profile={profile}/><div className="empty-state"><div className="loader"/>Loading project…</div></>
  if (!project) return <><Header profile={profile}/><main className="container not-found"><span className="eyebrow">PROJECT NOT FOUND</span><h1>This page isn't here.</h1><Link to="/" className="text-link"><ArrowLeft size={16}/> Back to all work</Link></main><Footer profile={profile}/></>
  const media = [...(project.project_media || [])].sort((a: any, b: any) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
  const cats = (project.project_categories || []).map((x: any) => x.category?.name).filter(Boolean)
  const sections = [{ title: 'The challenge', value: project.objective }, { title: 'The approach', value: project.strategy }, { title: 'What was delivered', value: project.deliverables }, { title: 'The outcome', value: project.results }]
  const related = projects.filter(p => p.id !== project.id && (p.project_categories || []).some((x: any) => cats.includes(x.category?.name))).slice(0, 2)
  return <><Header profile={profile}/><main className="container detail-page"><Link to="/" className="back-link"><ArrowLeft size={16}/> All projects</Link><div className="detail-heading"><span className="eyebrow">{cats.join(' / ') || 'CASE STUDY'}</span><h1>{project.title}</h1><p>{project.summary}</p></div>{media[0] && <div className="detail-cover" onClick={() => setSelectedImage(mediaUrl(media[0].storage_path))}><img src={mediaUrl(media[0].storage_path)} alt={media[0].alt_text || project.title}/></div>}<div className="detail-layout"><article className="detail-content"><section><span className="eyebrow">OVERVIEW</span><div className="rich-copy">{project.description || project.summary}</div></section>{sections.map(s => s.value && <section key={s.title}><span className="eyebrow">{s.title.toUpperCase()}</span>{Array.isArray(s.value) ? <ul className="deliverables">{s.value.map((v: any, i: number) => <li key={i}><Check size={16}/>{typeof v === 'string' ? v : v.title || v.name || JSON.stringify(v)}</li>)}</ul> : <p className="rich-copy">{typeof s.value === 'string' ? s.value : JSON.stringify(s.value)}</p>}</section>)}{media.length > 1 && <section><span className="eyebrow">PROJECT GALLERY</span><div className="gallery-grid">{media.slice(1).map((m: any) => <button key={m.id} onClick={() => setSelectedImage(mediaUrl(m.storage_path))}><img src={mediaUrl(m.storage_path)} alt={m.alt_text || project.title}/></button>)}</div></section>}</article><aside className="detail-aside"><div className="aside-card"><span className="eyebrow">PROJECT DETAILS</span>{project.client_visibility && project.client_name && <div><small>CLIENT</small><p>{project.client_name}</p></div>}<div><small>SERVICES</small><p>{cats.join(', ') || 'Digital services'}</p></div>{project.tags?.length > 0 && <div><small>FOCUS AREAS</small><p>{project.tags.join(' · ')}</p></div>}<Link to="/contact" className="button button-dark full">Discuss a similar project <ArrowUpRight size={16}/></Link></div></aside></div>{project.testimonials?.filter((t: any) => t.is_published).map((t: any) => <section className="testimonial-block" key={t.id}><span className="eyebrow">A CLIENT'S PERSPECTIVE</span><blockquote>“{t.content}”</blockquote><p>{t.client_name}{t.client_role && ' · ' + t.client_role}{t.company && ' · ' + t.company}</p></section>)}{related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2>Related work<span className="green-dot">.</span></h2></div></div><div className="project-grid">{related.map(p => <ProjectCard key={p.id} project={p}/>)}</div></section>}</main><Footer profile={profile}/>{selectedImage && <div className="lightbox" onClick={() => setSelectedImage(null)}><button aria-label="Close image"><X/></button><img src={selectedImage} alt="Project gallery preview"/></div>}</>
}

function ProfilePage() {
  const { profile } = usePortfolio()
  const skills = profile?.skills || []
  return <><Header profile={profile}/><main className="container profile-page"><span className="eyebrow">A LITTLE ABOUT US</span><div className="profile-hero"><div><h1>{profile?.display_name || 'Shorlah Cloud'}<span className="green-dot">.</span></h1><p className="profile-headline">{profile?.headline || 'Independent digital studio'}</p></div>{profile?.profile_image_path && <img className="profile-photo" src={mediaUrl(profile.profile_image_path)} alt={profile?.display_name || 'Profile'}/>}</div><div className="profile-body"><article><span className="eyebrow">THE PERSON BEHIND THE WORK</span><p className="profile-bio">{profile?.bio || 'The studio profile is being updated. Please check back soon.'}</p>{profile?.experience?.length > 0 && <div className="experience"><span className="eyebrow">EXPERIENCE</span>{profile?.experience?.map((e: any, i: number) => <div className="experience-item" key={i}><strong>{e.role || e.title}</strong><span>{e.company} {e.period && '· ' + e.period}</span>{e.description && <p>{e.description}</p>}</div>)}</div>}</article><aside><span className="eyebrow">SKILLS & EXPERTISE</span><div className="skill-list">{skills.map((s: string) => <span key={s}>{s}</span>)}</div><SocialLinks profile={profile}/>{profile?.cv_path && <a className="text-link" href={mediaUrl(profile.cv_path)} target="_blank" rel="noreferrer"><FileText size={16}/> View profile / CV</a>}<Link to="/contact" className="button button-dark full">Work with us <ArrowUpRight size={16}/></Link></aside></div></main><Footer profile={profile}/></>
}

function ContactPage() {
  const { profile } = usePortfolio()
  const [form, setForm] = useState({ full_name: '', email: '', service_interest: '', subject: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) { setState('error'); return }
    setState('sending')
    const { error } = await supabase.from('enquiries').insert({ ...form, owner_id: profile?.owner_id || null })
    setState(error ? 'error' : 'sent')
    if (!error) setForm({ full_name: '', email: '', service_interest: '', subject: '', message: '' })
  }
  return <><Header profile={profile}/><main className="container contact-page"><div className="contact-intro"><span className="eyebrow">LET'S TALK</span><h1>Have a good<br/><em>one in mind?</em></h1><p>Tell us what you're working on, where you're stuck, or what you'd like to build. We'll take it from there.</p><a className="text-link" href={profile?.contact_email ? 'mailto:' + profile.contact_email : 'mailto:hello@shorlahcloud.com'}><Mail size={16}/>{profile?.contact_email || 'Send an email'}</a></div><form className="contact-form" onSubmit={submit}><div className="form-row"><label>Your name<input required value={form.full_name} onChange={e => setForm({...form, full_name:e.target.value})} placeholder="How should we address you?"/></label><label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com"/></label></div><label>What do you need help with?<input value={form.service_interest} onChange={e => setForm({...form, service_interest:e.target.value})} placeholder="e.g. Reputation management, web development"/></label><label>Subject<input value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} placeholder="A short title for your enquiry"/></label><label>Tell us a little more<textarea required rows={5} value={form.message} onChange={e => setForm({...form, message:e.target.value})} placeholder="What are you hoping to achieve?"/></label><button className="button button-dark" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send enquiry'} <Send size={16}/></button>{state === 'sent' && <p className="success-note"><Check size={16}/> Your enquiry has been sent. Thank you.</p>}{state === 'error' && <p className="error-note">We couldn't send that just now. Please check your connection and try again.</p>}</form></main><Footer profile={profile}/></>
}

function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState('projects')
  const [profile, setProfile] = useState<Profile>({})
  const [profileExists, setProfileExists] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [notice, setNotice] = useState('')
  const [projectForm, setProjectForm] = useState({ title: '', slug: '', summary: '', description: '', objective: '', strategy: '', category_id: '', client_name: '', client_visibility: true, deliverables: '', results: '', tags: '', featured: false, is_published: false })
  const [categoryName, setCategoryName] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const db = supabase

  const loadAdmin = async (uid: string) => {
    if (!db) return
    const [p, w, c, e] = await Promise.all([
      db.from('profiles').select('*').eq('owner_id', uid).maybeSingle(),
      db.from('projects').select('*, project_media(*), project_categories(*)').eq('owner_id', uid).order('created_at', { ascending: false }),
      db.from('categories').select('*').eq('owner_id', uid).order('sort_order'),
      db.from('enquiries').select('*').order('created_at', { ascending: false }),
    ])
    if (p.error) {
      setNotice('Could not load your profile: ' + p.error.message)
    } else {
      setProfileExists(Boolean(p.data))
      setProfile(p.data || { owner_id: uid, display_name: 'Shorlah Cloud', is_published: false, skills: [], social_links: {} })
      if (!p.data) setTab('profile')
    }
    setProjects(w.data || [])
    setCategories(c.data || [])
    setEnquiries(e.data || [])
  }

  useEffect(() => {
    if (!db) return
    db.auth.getSession().then(({ data }) => { setSession(data.session); if (data.session) void loadAdmin(data.session.user.id) })
    const { data } = db.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next) void loadAdmin(next.user.id)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const authenticate = async (e: FormEvent) => {
    e.preventDefault()
    if (!db) return
    setAuthError('')
    const { error } = await db.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
  }

  const uploadProfileAsset = async (file: File, field: 'profile_image_path' | 'cv_path') => {
    if (!db || !session) return
    const path = session.user.id + '/profile/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, file, { upsert: false })
    if (error) setNotice(error.message)
    else {
      setProfile((current: Profile) => ({ ...current, [field]: path }))
      setNotice(field === 'cv_path' ? 'CV uploaded. Save your profile to publish the link.' : 'Profile image uploaded. Save your profile to publish it.')
    }
  }

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (!db || !session) return
    setBusy(true)
    const payload = { ...profile, owner_id: session.user.id }
    const { error } = await db.from('profiles').upsert(payload, { onConflict: 'owner_id' })
    setNotice(error ? error.message : 'Profile saved.')
    if (!error) setProfileExists(true)
    setBusy(false)
  }

  const addCategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!db || !session || !categoryName.trim()) return
    const slug = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const { error } = await db.from('categories').insert({ owner_id: session.user.id, name: categoryName.trim(), slug })
    setNotice(error ? error.message : 'Category added.')
    if (!error) { setCategoryName(''); void loadAdmin(session.user.id) }
  }

  const addProject = async (e: FormEvent) => {
    e.preventDefault()
    if (!db || !session) return
    setBusy(true)
    const slug = projectForm.slug.trim() || projectForm.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const payload = { ...projectForm, deliverables: projectForm.deliverables.split(/\r?\n/).map((v: string) => v.trim()).filter(Boolean), results: projectForm.results.split(/\r?\n/).map((v: string) => v.trim()).filter(Boolean), tags: projectForm.tags.split(',').map((v: string) => v.trim()).filter(Boolean), slug, owner_id: session.user.id, published_at: projectForm.is_published ? new Date().toISOString() : null }
    const result = editingId
      ? await db.from('projects').update(payload).eq('id', editingId).select().single()
      : await db.from('projects').insert(payload).select().single()
    const data = result.data
    const error = result.error
    if (error || !data) { setNotice(error?.message || 'Could not save project.'); setBusy(false); return }
    if (editingId) await db.from('project_categories').delete().eq('project_id', data.id)
    if (projectForm.category_id) {
      const map = await db.from('project_categories').insert({ owner_id: session.user.id, project_id: data.id, category_id: projectForm.category_id })
      if (map.error) setNotice(map.error.message)
    }
    const mediaFiles = [cover, ...galleryFiles].filter(Boolean) as File[]
    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i]
      const path = session.user.id + '/' + data.id + '/' + Date.now() + '-' + i + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const uploaded = await db.storage.from(MEDIA_BUCKET).upload(path, file, { upsert: false })
      if (!uploaded.error) {
        const saved = await db.from('project_media').insert({ owner_id: session.user.id, project_id: data.id, storage_path: path, media_type: 'image', alt_text: projectForm.title, is_cover: i === 0 && Boolean(cover), sort_order: i })
        if (saved.error) setNotice(saved.error.message)
      } else setNotice(uploaded.error.message)
    }
    setNotice(editingId ? 'Project updated.' : 'Project created.')
    setProjectForm({ title: '', slug: '', summary: '', description: '', objective: '', strategy: '', category_id: '', client_name: '', client_visibility: true, deliverables: '', results: '', tags: '', featured: false, is_published: false })
    setCover(null)
    setGalleryFiles([])
    setEditingId(null)
    await loadAdmin(session.user.id)
    setBusy(false)
  }

  const startEdit = (project: Project) => {
    setEditingId(project.id)
    setProjectForm({
      title: project.title || '', slug: project.slug || '', summary: project.summary || '',
      description: project.description || '', objective: project.objective || '', strategy: project.strategy || '',
      category_id: project.project_categories?.[0]?.category_id || '', client_name: project.client_name || '', client_visibility: project.client_visibility ?? true, deliverables: (project.deliverables || []).join('\n'), results: (project.results || []).join('\n'), tags: (project.tags || []).join(', '), featured: Boolean(project.featured), is_published: Boolean(project.is_published),
    })
    setCover(null)
    setGalleryFiles([])
    setTab('projects')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteProject = async (id: string) => {
    if (!db || !session || !window.confirm('Delete this project and its linked content?')) return
    const { error } = await db.from('projects').delete().eq('id', id)
    setNotice(error ? error.message : 'Project deleted.')
    if (!error) void loadAdmin(session.user.id)
  }

  const togglePublish = async (project: Project) => {
    if (!db || !session) return
    const { error } = await db.from('projects').update({ is_published: !project.is_published, published_at: !project.is_published ? new Date().toISOString() : null }).eq('id', project.id)
    setNotice(error ? error.message : 'Project visibility updated.')
    if (!error) void loadAdmin(session.user.id)
  }

  if (!isSupabaseConfigured || !db) return <main className="admin-shell"><div className="admin-login"><Brand/><h1>Connect your portfolio</h1><p>Add your Supabase URL and publishable key to the environment variables before opening the admin workspace.</p><Link to="/" className="text-link"><ArrowLeft size={16}/> Back to site</Link></div></main>
  if (!session) return <main className="admin-shell"><form className="admin-login" onSubmit={authenticate}><Brand/><span className="eyebrow">PRIVATE WORKSPACE</span><h1>Welcome back.</h1><p>Sign in to manage your Shorlah Cloud portfolio.</p><label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e => setPassword(e.target.value)}/></label><button className="button button-dark full">Sign in <ArrowRight size={16}/></button>{authError && <p className="error-note">{authError}</p>}<Link to="/" className="back-link"><ArrowLeft size={15}/> Return to portfolio</Link></form></main>

  return <div className="admin-shell"><aside className="admin-sidebar"><Brand/><span className="eyebrow">WORKSPACE</span>{[['projects','Projects'],['categories','Categories'],['profile','Profile'],['enquiries','Enquiries']].map(([id, label]) => <button key={id} className={tab === id ? 'admin-nav active' : 'admin-nav'} onClick={() => { setTab(id); setNotice('') }}>{label}{id === 'enquiries' && enquiries.filter(e => e.status === 'new').length > 0 && <i>{enquiries.filter(e => e.status === 'new').length}</i>}</button>)}<div className="admin-sidebar-bottom"><Link to="/" target="_blank">View public site <ExternalLink size={14}/></Link><button onClick={() => db.auth.signOut()}>Sign out</button></div></aside><main className="admin-main"><div className="admin-top"><div><span className="eyebrow">SHORLAH CLOUD / ADMIN</span><h1>{tab[0].toUpperCase() + tab.slice(1)}</h1></div><span className="admin-user">{session.user.email}</span></div>{notice && <p className="admin-notice">{notice}</p>}
    {tab === 'projects' && <div className="admin-content"><section className="admin-panel"><h2>Add a project</h2><form className="admin-form" onSubmit={addProject}><label>Project title<input required value={projectForm.title} onChange={e => setProjectForm({...projectForm, title:e.target.value})} placeholder="Project name"/></label><label>URL slug (optional)<input value={projectForm.slug} onChange={e => setProjectForm({...projectForm, slug:e.target.value})} placeholder="project-name"/></label><label>Short summary<input required value={projectForm.summary} onChange={e => setProjectForm({...projectForm, summary:e.target.value})} placeholder="A concise project introduction"/></label><label>Overview<textarea rows={4} value={projectForm.description} onChange={e => setProjectForm({...projectForm, description:e.target.value})}/></label><div className="form-row"><label>Challenge / objective<textarea rows={3} value={projectForm.objective} onChange={e => setProjectForm({...projectForm, objective:e.target.value})}/></label><label>Strategy / approach<textarea rows={3} value={projectForm.strategy} onChange={e => setProjectForm({...projectForm, strategy:e.target.value})}/></label></div><label>Client / brand name (optional)<input value={projectForm.client_name} onChange={e => setProjectForm({...projectForm, client_name:e.target.value})} placeholder="Client name"/></label><label>Work delivered (one item per line)<textarea rows={3} value={projectForm.deliverables} onChange={e => setProjectForm({...projectForm, deliverables:e.target.value})} placeholder="Website redesign\\nReputation monitoring"/></label><label>Results / outcomes (one item per line; use verified facts only)<textarea rows={3} value={projectForm.results} onChange={e => setProjectForm({...projectForm, results:e.target.value})} placeholder="Add only outcomes you can substantiate"/></label><label>Tags (comma separated)<input value={projectForm.tags} onChange={e => setProjectForm({...projectForm, tags:e.target.value})} placeholder="Strategy, SEO, Automation"/></label><label>Category<select value={projectForm.category_id} onChange={e => setProjectForm({...projectForm, category_id:e.target.value})}><option value="">Choose a category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Cover image<input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)}/></label><label>Additional gallery images<input type="file" accept="image/*" multiple onChange={e => setGalleryFiles(Array.from(e.target.files || []))}/></label><div className="check-row"><label><input type="checkbox" checked={projectForm.client_visibility} onChange={e => setProjectForm({...projectForm, client_visibility:e.target.checked})}/> Show client name publicly</label><label><input type="checkbox" checked={projectForm.featured} onChange={e => setProjectForm({...projectForm, featured:e.target.checked})}/> Feature this project</label><label><input type="checkbox" checked={projectForm.is_published} onChange={e => setProjectForm({...projectForm, is_published:e.target.checked})}/> Publish immediately</label></div><div className="form-actions"><button className="button button-dark" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save project changes' : 'Create project'} <Plus size={16}/></button>{editingId && <button type="button" className="cancel-edit" onClick={() => { setEditingId(null); setProjectForm({ title: '', slug: '', summary: '', description: '', objective: '', strategy: '', category_id: '', client_name: '', client_visibility: true, deliverables: '', results: '', tags: '', featured: false, is_published: false }); setCover(null); setGalleryFiles([]) }}>Cancel edit</button>}</div></form></section><section className="admin-panel"><div className="panel-heading"><h2>Your projects</h2><span>{projects.length} total</span></div>{projects.length ? projects.map(p => <div className="admin-list-item" key={p.id}><div><strong>{p.title}</strong><small>{p.slug} · {p.is_published ? 'Published' : 'Draft'}</small></div><div className="item-actions"><button onClick={() => startEdit(p)}>Edit</button><button onClick={() => togglePublish(p)}>{p.is_published ? 'Unpublish' : 'Publish'}</button><button className="danger" onClick={() => deleteProject(p.id)}>Delete</button></div></div>) : <p className="muted">No projects yet. Add your first case study above.</p>}</section></div>}
    {tab === 'categories' && <section className="admin-panel narrow-panel"><h2>Project categories</h2><form className="inline-form" onSubmit={addCategory}><input required value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="New category name"/><button className="button button-dark"><Plus size={16}/> Add</button></form>{categories.map(c => <div className="admin-list-item" key={c.id}><strong>{c.name}</strong><small>{c.slug}</small></div>)}</section>}
    {tab === 'profile' && <section className="admin-panel narrow-panel"><h2>{profileExists ? 'Public profile' : 'Create your public profile'}</h2>{!profileExists && <p className="muted">This is your first-time setup. Add the details visitors should see on your portfolio. Your profile stays private until you enable “Publish profile” below.</p>}<form className="admin-form" onSubmit={saveProfile}><label>Display name<input value={profile.display_name || ''} onChange={e => setProfile({...profile, display_name:e.target.value})}/></label><label>Professional headline<input value={profile.headline || ''} onChange={e => setProfile({...profile, headline:e.target.value})}/></label><label>Biography<textarea rows={6} value={profile.bio || ''} onChange={e => setProfile({...profile, bio:e.target.value})}/></label><label>Contact email<input type="email" value={profile.contact_email || ''} onChange={e => setProfile({...profile, contact_email:e.target.value})}/></label><label>Location<input value={profile.location || ''} onChange={e => setProfile({...profile, location:e.target.value})}/></label><label>Profile picture<input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) void uploadProfileAsset(file, 'profile_image_path') }}/></label>{profile.profile_image_path && <small className="asset-hint">Profile image uploaded and ready to save.</small>}<label>CV / portfolio document (PDF)<input type="file" accept="application/pdf" onChange={e => { const file = e.target.files?.[0]; if (file) void uploadProfileAsset(file, 'cv_path') }}/></label>{profile.cv_path && <small className="asset-hint">CV uploaded and ready to save.</small>}<label>Skills (comma separated)<input value={(profile.skills || []).join(', ')} onChange={e => setProfile({...profile, skills:e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})}/></label><label>LinkedIn URL<input value={profile.social_links?.linkedin || ''} onChange={e => setProfile({...profile, social_links:{...(profile.social_links || {}), linkedin:e.target.value}})}/></label><label>Instagram URL<input value={profile.social_links?.instagram || ''} onChange={e => setProfile({...profile, social_links:{...(profile.social_links || {}), instagram:e.target.value}})}/></label><label>Website URL<input value={profile.social_links?.website || ''} onChange={e => setProfile({...profile, social_links:{...(profile.social_links || {}), website:e.target.value}})}/></label><label><span><input type="checkbox" checked={Boolean(profile.is_published)} onChange={e => setProfile({...profile, is_published:e.target.checked})}/> Publish profile</span></label><button className="button button-dark" disabled={busy}>{busy ? 'Saving…' : profileExists ? 'Save profile' : 'Create profile'} <Check size={16}/></button></form></section>}
    {tab === 'enquiries' && <section className="admin-panel"><h2>Client enquiries</h2>{enquiries.length ? enquiries.map(e => <div className="enquiry-item" key={e.id}><div><strong>{e.subject || e.service_interest || 'New enquiry'}</strong><small>{e.full_name} · {e.email} · {new Date(e.created_at).toLocaleDateString()}</small><p>{e.message}</p></div><span className={'status-pill status-' + e.status}>{e.status}</span></div>) : <p className="muted">No enquiries have arrived yet.</p>}</section>}
  </main></div>
}

export default function App() {
  return <Routes><Route path="/" element={<Home/>}/><Route path="/project/:slug" element={<ProjectDetail/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<Home/>}/></Routes>
}
