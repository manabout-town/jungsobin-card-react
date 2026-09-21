import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type InputHTMLAttributes, type PointerEvent } from 'react'
import { CHECKS, FAQ, PRINCIPLES, PROFILE as P, STAGES, SUBMIT_URL } from './data'

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches

function Umbrella({ open }: { open: boolean }) {
  return (
    <svg className={'umb' + (open ? ' on' : '')} viewBox="0 0 120 120" aria-hidden="true">
      <path className="canopy" d="M10 62 Q60 -4 110 62 Q97 52 85 62 Q72 52 60 62 Q48 52 35 62 Q23 52 10 62Z" />
      <path className="shaft" d="M60 30 V98 Q60 108 51 108 Q44 108 44 101" />
    </svg>
  )
}

function Intro() {
  const [stage, setStage] = useState(RM ? 3 : 0) // 0 대기 · 1 우산 펼침 · 2 걷힘 · 3 끝
  useEffect(() => {
    if (RM) return
    document.documentElement.classList.add('lock')
    const t1 = setTimeout(() => setStage(s => Math.max(s, 1)), 380)
    const t2 = setTimeout(() => setStage(s => Math.max(s, 2)), 1900)
    const t3 = setTimeout(() => setStage(3), 4000) // 느린 망에서도 4초면 강제 개봉
    const skip = () => setStage(s => Math.max(s, 2))
    const evs = ['wheel', 'touchstart', 'keydown', 'click'] as const
    evs.forEach(e => addEventListener(e, skip, { once: true, passive: true }))
    return () => { [t1, t2, t3].forEach(clearTimeout); evs.forEach(e => removeEventListener(e, skip)) }
  }, [])
  useEffect(() => {
    if (stage < 2) return
    const t = setTimeout(() => { setStage(3); document.documentElement.classList.remove('lock') }, 620)
    return () => clearTimeout(t)
  }, [stage])
  if (stage === 3) return null
  return (
    <div className={'intro s' + stage} aria-hidden="true">
      <Umbrella open={stage >= 1} />
      <p>비 오기 전에 펴는 우산</p>
      <small>정소빈 · 굿리치 보험설계사</small>
    </div>
  )
}

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [ok, setOk] = useState(false)
  const [dead, setDead] = useState(false)
  if (dead) return null
  return <img className={(className ?? '') + (ok ? ' ok' : '')} src={src} alt={alt} decoding="async"
    onLoad={() => setOk(true)} onError={() => setDead(true)} />
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv')
    if (RM) { els.forEach(e => e.classList.add('lit')); return }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('lit'); io.unobserve(e.target) }
    }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])
}

function Header() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let tick = false
    const on = () => {
      if (tick) return
      tick = true
      requestAnimationFrame(() => {
        tick = false
        const h = document.documentElement.scrollHeight - innerHeight
        if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`
      })
    }
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <header className="hd">
      <a href="#top" className="brand"><b>정소빈</b><span>굿리치 보험설계사</span></a>
      <a className="btn sm" href={`tel:${P.mobile}`}>전화 상담</a>
      <div className="prog" ref={bar} aria-hidden="true" />
    </header>
  )
}

function Hero() {
  return (
    <section className="hero bento" id="top">
      <div className="tile hero-main">
        <Img src="/img/hero-consult.jpg" alt="" className="bg" />
        <div className="scrim" aria-hidden="true" />
        <div className="hero-copy">
          <p className="who">정소빈 · 굿리치 보험설계사</p>
          <h1>보험은 많은데,<br />무엇이 준비됐는지 모를 때</h1>
          <p className="lead">가입한 증권을 전부 조회해<br />표 한 장으로 정리해 드립니다.</p>
          <div className="ctas">
            <a className="btn" href={`tel:${P.mobile}`}>전화 상담</a>
            <a className="btn ghost" href="#contact">무료 증권 분석 신청</a>
          </div>
        </div>
      </div>
      <div className="tile me rv">
        <Img src="/img/profile.jpg" alt="정소빈 설계사 프로필 사진" className="pic" />
        <div>
          <b>정소빈</b>
          <span>굿리치 · 부산 센텀</span>
        </div>
      </div>
      <div className="tile fee rv">
        <strong>0<small>원</small></strong>
        <span>상담료 · 분석표까지 무료</span>
      </div>
      <div className="tile place rv">
        <strong>대면 · 화상</strong>
        <span>부산 센텀 사무실 또는 화상으로<br />{P.hours}</span>
      </div>
    </section>
  )
}

function Principles() {
  return (
    <section className="sec">
      <h2 className="rv">새로 드는 순서가 아니라,<br />확인하는 순서로 봅니다</h2>
      <div className="bento three">
        {PRINCIPLES.map((p, i) => (
          <article key={p.t} className={'tile pr rv' + (i === 0 ? ' brandfill' : '')}>
            <span className="num" aria-hidden="true">{i + 1}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Lifecycle() {
  const wrap = useRef<HTMLElement>(null)
  const [i, setI] = useState(0)
  const [pinned, setPinned] = useState(() => matchMedia('(min-height: 600px)').matches)

  useEffect(() => {
    const mq = matchMedia('(min-height: 600px)')
    const on = () => setPinned(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    if (!pinned) return
    let tick = false
    const on = () => {
      if (tick) return
      tick = true
      requestAnimationFrame(() => {
        tick = false
        const el = wrap.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const p = Math.min(0.999, Math.max(0, -r.top / (r.height - innerHeight)))
        setI(Math.floor(p * STAGES.length))
        // 핀 구간에선 하단 연락 바가 보장 카드를 가리므로 잠시 내린다
        document.body.classList.toggle('in-pin', r.top <= 0 && r.bottom >= innerHeight)
      })
    }
    on()
    addEventListener('scroll', on, { passive: true })
    return () => { removeEventListener('scroll', on); document.body.classList.remove('in-pin') }
  }, [pinned])

  const go = (k: number) => {
    const el = wrap.current
    if (!pinned || !el) return setI(k)
    const top = el.getBoundingClientRect().top + scrollY
    scrollTo({ top: top + ((k + 0.5) / STAGES.length) * (el.offsetHeight - innerHeight), behavior: RM ? 'auto' : 'smooth' })
  }

  const s = STAGES[i]
  return (
    <section ref={wrap} id="flow" className={'life' + (pinned ? ' pinned' : '')} style={pinned ? { height: `${STAGES.length * 70 + 100}svh` } : undefined}>
      <div className="life-in">
        <div className="life-head">
          <h2>나이가 바뀌면<br />필요한 보장도 바뀝니다</h2>
          <div className="tabs" role="tablist" aria-label="생애 주기">
            {STAGES.map((x, k) => (
              <button key={x.k} role="tab" type="button" aria-selected={k === i} onClick={() => go(k)}>{x.k}</button>
            ))}
          </div>
        </div>
        <div className="bento life-grid" key={i}>
          <div className="tile age swap" style={{ '--lv': i / (STAGES.length - 1) } as CSSProperties}>
            <span className="tag">{s.tag}</span>
            <strong>{s.k}</strong>
            <p>{s.risk}</p>
            <div className="dots" aria-hidden="true">
              {STAGES.map((_, k) => <i key={k} className={k <= i ? 'on' : ''} />)}
            </div>
          </div>
          <div className="tile plan swap">
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </div>
          <ul className="cov swap" aria-label={`${s.k} 먼저 볼 보장`}>
            {s.cov.map(([a, b]) => <li key={a} className="tile"><span>{a}</span><b>{b}</b></li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section className="sec faq">
      <h2 className="rv">자주 받는 질문</h2>
      <div className="faq-list">
        {FAQ.map(f => (
          <details key={f.q} className="tile rv">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function BizCard() {
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState<boolean[]>(() => CHECKS.map(() => false))
  const ref = useRef<HTMLDivElement>(null)
  const n = done.filter(Boolean).length
  const verdict = n <= 3 ? '한 번 정리할 때입니다' : n < 6 ? '거의 정리돼 있습니다' : '아주 잘 관리하고 계십니다'

  useEffect(() => {
    if (RM || !ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      el.classList.add('wave'); setTimeout(() => el.classList.remove('wave'), 1300); io.disconnect()
    }, { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (RM || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`)
    e.currentTarget.style.setProperty('--rx', `${(0.5 - (e.clientY - r.top) / r.height) * 8}deg`)
  }
  const reset = (e: PointerEvent<HTMLDivElement>) => { e.currentTarget.style.setProperty('--ry', '0deg'); e.currentTarget.style.setProperty('--rx', '0deg') }

  return (
    <div className="card-zone">
      <div ref={ref} className={'nc' + (flipped ? ' flipped' : '')} onPointerMove={tilt} onPointerLeave={reset}>
        <div className="nc-in">
          <button type="button" className="face front" onClick={() => setFlipped(true)} aria-label="명함 뒤집어 보장 점검 체크리스트 보기">
            <span className="logo" aria-hidden="true">G</span>
            <span className="nm">정소빈</span>
            <span className="jt">굿리치 · 보험설계사</span>
            <span className="ct">M {P.mobile}<br />T {P.tel}<br />{P.email}</span>
            <span className="hint" aria-hidden="true">눌러서 뒤집기 → 체크리스트</span>
          </button>
          <div className="face back" aria-hidden={!flipped}>
            <div className="back-hd">
              <b>보장 점검 체크리스트</b>
              <button type="button" className="x" onClick={() => setFlipped(false)} tabIndex={flipped ? 0 : -1} aria-label="명함 앞면으로">↺</button>
            </div>
            <ul className="chk">
              {CHECKS.map((c, k) => (
                <li key={c}>
                  <button type="button" aria-pressed={done[k]} tabIndex={flipped ? 0 : -1}
                    onClick={() => setDone(d => d.map((v, j) => (j === k ? !v : v)))}>
                    <i aria-hidden="true" /><span>{c}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="score" role="status" aria-live="polite"><b>{n} / 6</b> · {verdict}</p>
          </div>
        </div>
      </div>
      <p className="card-note">체크가 3개 이하라면 한 번 정리할 때입니다. 결과를 캡처해 보내주셔도 됩니다.</p>
    </div>
  )
}

function saveVcf(toast: (m: string) => void) {
  const v = ['BEGIN:VCARD', 'VERSION:3.0', 'N:정;소빈;;;', 'FN:정소빈', 'ORG:굿리치', 'TITLE:보험설계사',
    'TEL;TYPE=CELL:+82-10-6514-3032', 'TEL;TYPE=WORK,VOICE:+82-51-953-0581', 'TEL;TYPE=FAX:+82-51-923-1203',
    `EMAIL;TYPE=WORK:${P.email}`, 'ADR;TYPE=WORK:;센텀드림월드 1402호;센텀2로 25;해운대구;부산;;KR', 'END:VCARD'].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([v], { type: 'text/vcard;charset=utf-8' }))
  a.download = 'jungsobin.vcf'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  toast('연락처 파일을 내려받았어요')
}

type Errs = Partial<Record<'nm' | 'ph' | 'bd' | 'rg' | 'send', string>>

function Form({ toast }: { toast: (m: string) => void }) {
  const [errs, setErrs] = useState<Errs>({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const v = (k: string) => String(f.get(k) ?? '').trim()
    const nm = v('nm'), ph = v('ph'), bd = v('bd'), rg = v('rg')
    const er: Errs = {}
    if (!nm) er.nm = '성함을 입력해 주세요.'
    if (!/^01[0-9]{8,9}$/.test(ph.replace(/[^0-9]/g, ''))) er.ph = '예: 010-1234-5678'
    if (!/^[0-9.\-/]{6,10}$/.test(bd)) er.bd = '숫자로 입력해 주세요. 예: 1985-03-17'
    if (!rg) er.rg = '지역을 입력해 주세요.'
    setErrs(er)
    if (Object.keys(er).length) return
    setBusy(true)
    try {
      const r = await fetch(SUBMIT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nm, phone: ph, birth: bd, region: rg }) })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setSent(true); toast('상담 신청이 접수됐어요')
    } catch {
      setErrs({ send: `전송에 실패했습니다. 전화(${P.mobile})로 연락 주세요.` })
    } finally { setBusy(false) }
  }

  if (sent) return (
    <div className="tile form done">
      <h3>신청이 접수됐습니다</h3>
      <p>확인 후 순차적으로 연락드립니다. 급하시면 {P.mobile}로 바로 전화 주세요.</p>
    </div>
  )
  const field = (id: keyof Errs, label: string, props: InputHTMLAttributes<HTMLInputElement>) => (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} aria-invalid={!!errs[id]} aria-describedby={errs[id] ? id + '-e' : undefined} {...props} />
      {errs[id] && <span className="err" id={id + '-e'}>{errs[id]}</span>}
    </div>
  )
  return (
    <form className="tile form" onSubmit={submit} noValidate>
      <h3>무료 증권 분석 신청</h3>
      <p className="sub">네 가지만 남겨주시면 설계사가 확인 후 순차적으로 연락드립니다.</p>
      <div className="flds">
        {field('nm', '성함', { autoComplete: 'name', placeholder: '홍길동' })}
        {field('ph', '휴대폰', { type: 'tel', inputMode: 'numeric', autoComplete: 'tel', placeholder: '010-0000-0000' })}
        {field('bd', '생년월일', { inputMode: 'numeric', autoComplete: 'bday', placeholder: '1985-03-17' })}
        {field('rg', '지역', { autoComplete: 'address-level2', placeholder: '부산 해운대구' })}
      </div>
      <button className="btn full" type="submit" disabled={busy}>{busy ? '보내는 중…' : '분석 신청 보내기'}</button>
      <p className="err" role="status" aria-live="polite">{errs.send}</p>
      <p className="fine">남겨주신 내용은 상담 목적으로만 쓰고, 설계사만 확인합니다.</p>
    </form>
  )
}

function Contact({ toast }: { toast: (m: string) => void }) {
  return (
    <section className="sec" id="contact">
      <h2 className="rv">명함 저장하고,<br />체크리스트로 한 번 점검해보세요</h2>
      <div className="bento contact">
        <div className="tile card-tile rv"><BizCard /></div>
        <Form toast={toast} />
        <div className="tile links rv">
          <button type="button" onClick={() => saveVcf(toast)}><b>연락처 저장</b><span>휴대폰 주소록에 바로 추가</span></button>
          <a href={`sms:${P.mobile}?body=${encodeURIComponent('보장 점검 상담 문의드립니다')}`}><b>문자 보내기</b><span>{P.mobile}</span></a>
          <a href={P.map} target="_blank" rel="noopener"><b>오시는 길</b><span>{P.addr}</span></a>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [msg, setMsg] = useState('')
  const [on, setOn] = useState(false)
  const tRef = useRef<number>(0)
  const toast = (m: string) => { setMsg(m); setOn(true); clearTimeout(tRef.current); tRef.current = setTimeout(() => setOn(false), 2400) }
  useReveal()
  return (
    <>
      <Intro />
      <Header />
      <main>
        <Hero />
        <Principles />
        <Lifecycle />
        <Faq />
        <Contact toast={toast} />
      </main>
      <footer className="ft">
        <p>굿리치 · 정소빈 보험설계사 · {P.addr}</p>
        <p>M {P.mobile} · T {P.tel} · F {P.fax} · {P.email}</p>
        <p>보험 계약 체결 전 상품설명서와 약관을 확인하시기 바랍니다.</p>
      </footer>
      <nav className="dock" aria-label="빠른 연락">
        <a className="btn" href={`tel:${P.mobile}`}>전화 상담</a>
        <a className="btn ghost" href="#contact">분석 신청</a>
      </nav>
      <div className={'toast' + (on ? ' on' : '')} role="status" aria-live="polite">{msg}</div>
    </>
  )
}
