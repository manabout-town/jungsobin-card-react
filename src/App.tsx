import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type InputHTMLAttributes } from 'react'
import { CHECKS, FAQ, PRINCIPLES, PROFILE as P, SHEET, STAGES, STEPS, SUBMIT_URL } from './data'

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches
const won = (n: number) => n.toLocaleString('ko-KR')

// 진입: 흩어진 증권 여섯 장이 한 장으로 겹쳐진다
const PAPERS = [[-38, -22, -14], [30, -30, 11], [-30, 26, 8], [36, 20, -9], [-6, -40, 4], [4, 34, -5]]

function Intro() {
  const [stage, setStage] = useState(RM ? 3 : 0) // 0 흩어짐 · 1 모임 · 2 걷힘 · 3 끝
  useEffect(() => {
    if (RM) return
    document.documentElement.classList.add('lock')
    const t1 = setTimeout(() => setStage(s => Math.max(s, 1)), 450)
    const t2 = setTimeout(() => setStage(s => Math.max(s, 2)), 2100)
    const t3 = setTimeout(() => setStage(3), 4000) // 느린 망에서도 4초면 강제 개봉
    const skip = () => setStage(s => Math.max(s, 2))
    const evs = ['wheel', 'touchstart', 'keydown', 'click'] as const
    evs.forEach(e => addEventListener(e, skip, { once: true, passive: true }))
    return () => { [t1, t2, t3].forEach(clearTimeout); evs.forEach(e => removeEventListener(e, skip)) }
  }, [])
  useEffect(() => {
    if (stage < 2) return
    const t = setTimeout(() => { setStage(3); document.documentElement.classList.remove('lock') }, 640)
    return () => clearTimeout(t)
  }, [stage])
  if (stage === 3) return null
  return (
    <div className={'intro s' + stage} aria-hidden="true">
      <div className="pile">
        {PAPERS.map(([x, y, r], k) => (
          <i key={k} style={{ '--x': `${x}vmin`, '--y': `${y}vmin`, '--r': `${r}deg`, '--d': `${k * 50}ms` } as CSSProperties} />
        ))}
      </div>
      <p>흩어진 증권을 한 장으로</p>
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
      <nav className="hd-nav" aria-label="섹션">
        <a href="#sheet">분석표</a>
        <a href="#life">나이별 보장</a>
        <a href="#check">자가 점검</a>
      </nav>
      <a className="btn sm" href={`tel:${P.mobile}`}>전화 상담</a>
      <div className="prog" ref={bar} aria-hidden="true" />
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="who">정소빈 · 굿리치 보험설계사 · 부산 센텀</p>
        <h1>보험이 몇 개인지<br />세어 보셨나요?</h1>
        <p className="lead">가입한 증권을 전부 조회해<br />표 한 장으로 정리해 드립니다.</p>
        <div className="ctas">
          <a className="btn" href={`tel:${P.mobile}`}>전화 상담</a>
          <a className="btn line" href="#contact">무료 분석 신청</a>
        </div>
      </div>
      <figure className="hero-pic">
        <Img src="/img/hero-consult.jpg" alt="상담 테이블에서 보장 분석표를 함께 짚어보는 모습" />
      </figure>
    </section>
  )
}

function About() {
  return (
    <section className="sec about">
      <figure className="about-pic rv">
        <Img src="/img/profile.jpg" alt="정소빈 설계사" />
      </figure>
      <div className="about-copy rv">
        <h2>새로 드는 것보다<br />가진 걸 먼저 봅니다</h2>
        <p>굿리치 소속 보험설계사 정소빈입니다. 부산 센텀 사무실에서 대면으로, 멀리 계신 분은 화상으로 만납니다.
          상담은 늘 이미 가입한 증권을 확인하는 데서 시작합니다.</p>
        <ul className="facts">
          <li><strong>0<small>원</small></strong><span>상담료 · 분석표까지</span></li>
          <li><strong>1<small>장</small></strong><span>모든 계약을 한 표에</span></li>
          <li><strong>당일</strong><span>가입 권유 없음</span></li>
        </ul>
      </div>
    </section>
  )
}

function Principles() {
  return (
    <section className="sec">
      <h2 className="rv">상담은 이 순서를<br />지킵니다</h2>
      <div className="pr-grid">
        {PRINCIPLES.map(p => (
          <article key={p.t} className="pr rv">
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function useCount(target: number) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    if (RM) return
    const a = from.current, t0 = performance.now()
    let id = 0
    const f = (t: number) => {
      const k = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 3)
      setV(Math.round(a + (target - a) * e))
      if (k < 1) id = requestAnimationFrame(f); else from.current = target
    }
    id = requestAnimationFrame(f)
    return () => cancelAnimationFrame(id)
  }, [target])
  return RM ? target : v
}

// 센터피스: 스크롤하면 분석표가 한 단계씩 채워진다
function Sheet() {
  const wrap = useRef<HTMLElement>(null)
  const [i, setI] = useState(0)
  const [seen, setSeen] = useState(RM)
  const [pinned, setPinned] = useState(() => matchMedia('(min-height: 540px)').matches)

  useEffect(() => {
    const mq = matchMedia('(min-height: 540px)')
    const on = () => setPinned(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    let tick = false
    const on = () => {
      if (tick) return
      tick = true
      requestAnimationFrame(() => {
        tick = false
        const el = wrap.current
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.top < innerHeight * 0.7) setSeen(true)
        if (!pinned) return
        const p = Math.min(0.999, Math.max(0, -r.top / (r.height - innerHeight)))
        setI(Math.floor(p * STEPS.length))
        document.body.classList.toggle('in-pin', r.top <= 0 && r.bottom > innerHeight * 0.5)
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
    scrollTo({ top: top + ((k + 0.5) / STEPS.length) * (el.offsetHeight - innerHeight), behavior: RM ? 'auto' : 'smooth' })
  }

  const before = SHEET.filter(r => !r.gap).reduce((a, r) => a + r.m, 0)
  const after = SHEET.filter(r => !r.dup).reduce((a, r) => a + (r.trim ? r.trim[1] : r.m), 0)
  const total = useCount(i >= 3 ? after : before)
  const s = STEPS[i]

  return (
    <section ref={wrap} id="sheet" className={'sheet' + (pinned ? ' pinned' : '')}
      style={pinned ? { height: `${STEPS.length * 75 + 100}svh` } : undefined}>
      <div className="sheet-in">
        <div className="sheet-copy">
          <div className="steps" role="tablist" aria-label="분석 단계">
            {STEPS.map((x, k) => (
              <button key={x.t} type="button" role="tab" aria-selected={k === i} aria-label={`${k + 1}단계 ${x.t}`}
                className={k <= i ? 'on' : ''} onClick={() => go(k)} />
            ))}
          </div>
          <h2 key={'t' + i} className="swap">{s.t}</h2>
          <p key={'d' + i} className="swap">{s.d}</p>
        </div>
        <div className={'paper st' + i + (seen ? ' lit' : '')}>
          <div className="paper-hd">
            <b>보장 분석표</b>
            <span>예시 · 실제 고객 자료 아님</span>
          </div>
          <ul className="rows">
            {SHEET.map((r, k) => {
              const note = r.dup && i >= 1 ? r.dup : r.gap && i >= 2 ? '빠진 보장' : r.trim && i >= 3 ? r.trim[0] : ''
              const cut = !!r.trim && i >= 3
              return (
                <li key={r.n + r.co} style={{ '--k': k } as CSSProperties}
                  className={[r.dup && i >= 1 && 'dup', r.dup && i >= 3 && 'gone', r.gap && 'gap', r.gap && i >= 2 && 'show', note && 'noted'].filter(Boolean).join(' ')}>
                  <span className="rn"><b>{r.n}</b>{note ? <small className="note">{note}</small> : <small>{r.co}</small>}</span>
                  <span className="amt">{cut && <s>{won(r.m)}</s>}<em>{won(cut ? r.trim![1] : r.m)}</em></span>
                </li>
              )
            })}
          </ul>
          <div className="paper-ft">
            <span>{i >= 3 ? '정리 후 월 보험료' : '지금 월 보험료'}
              <em aria-live="polite">{i >= 3 ? `보장 한 칸 늘고 월 ${won(before - after)}원 절감` : ''}</em></span>
            <strong>{won(total)}<small>원</small></strong>
          </div>
        </div>
      </div>
    </section>
  )
}

function Life() {
  const [i, setI] = useState(1)
  const s = STAGES[i]
  return (
    <section className="sec life" id="life">
      <h2 className="rv">나이가 바뀌면<br />먼저 볼 보장도 바뀝니다</h2>
      <div className="tabs rv" role="tablist" aria-label="나이대">
        {STAGES.map((x, k) => (
          <button key={x.k} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)}>{x.k}</button>
        ))}
      </div>
      <div className="life-body" key={i} role="tabpanel">
        <div className="life-main swap">
          <span className="tag">{s.tag} · {s.risk}</span>
          <h3>{s.t}</h3>
          <p>{s.d}</p>
        </div>
        <ul className="cov swap" aria-label={`${s.k} 먼저 볼 보장`}>
          {s.cov.map(([a, b]) => <li key={a}><span>{a}</span><b>{b}</b></li>)}
        </ul>
      </div>
    </section>
  )
}

function Check() {
  const [done, setDone] = useState<boolean[]>(() => CHECKS.map(() => false))
  const n = done.filter(Boolean).length
  const verdict = n <= 3 ? '한 번 정리할 때입니다' : n < 6 ? '거의 정리돼 있습니다' : '잘 관리하고 계십니다'
  return (
    <section className="sec check" id="check">
      <div className="check-hd rv">
        <h2>내 보험,<br />여섯 가지만 확인해 보세요</h2>
        <p>아는 항목을 눌러 표시하세요. 세 개 이하라면 정리할 때입니다.</p>
      </div>
      <ul className="chk">
        {CHECKS.map((c, k) => (
          <li key={c} className="rv">
            <button type="button" aria-pressed={done[k]} onClick={() => setDone(d => d.map((v, j) => (j === k ? !v : v)))}>
              <i aria-hidden="true" /><span>{c}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="score rv" role="status" aria-live="polite">
        <strong>{n}<small> / 6</small></strong>
        <span>{verdict}</span>
        <a className="btn inv" href="#contact">분석표 받아보기</a>
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
          <details key={f.q} className="rv">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
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

// 명함 사물: 접힌 명함을 누르면 아래로 펼쳐져 연락처가 나온다
function FoldCard({ toast }: { toast: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  const t = open ? 0 : -1
  return (
    <div className={'fold' + (open ? ' open' : '')}>
      <div className="leaf">
        <Img src="/img/profile.jpg" alt="" className="leaf-pic" />
        <div>
          <b>정소빈</b>
          <span>굿리치 · 보험설계사</span>
          <em>가입 말고, 확인부터</em>
        </div>
      </div>
      <div className="cover">
        <button type="button" className="face front" onClick={() => setOpen(true)} aria-expanded={open} aria-label="명함 펼쳐서 연락처 보기">
          <span className="org">굿리치</span>
          <span className="nm">정소빈</span>
          <span className="jt">보험설계사</span>
          <span className="hint" aria-hidden="true">눌러서 펼치기</span>
        </button>
        <div className="face back" aria-hidden={!open}>
          <dl>
            <div><dt>휴대폰</dt><dd><a href={`tel:${P.mobile}`} tabIndex={t}>{P.mobile}</a></dd></div>
            <div><dt>사무실</dt><dd><a href={`tel:${P.tel}`} tabIndex={t}>{P.tel}</a></dd></div>
            <div><dt>메일</dt><dd><a href={`mailto:${P.email}`} tabIndex={t}>{P.email}</a></dd></div>
          </dl>
          <div className="back-ft">
            <button type="button" className="save" onClick={() => saveVcf(toast)} tabIndex={t}>연락처 저장</button>
            <button type="button" className="close" onClick={() => setOpen(false)} tabIndex={t}>접기</button>
          </div>
        </div>
      </div>
    </div>
  )
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
    <div className="form done">
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
    <form className="form" onSubmit={submit} noValidate>
      <h3>무료 분석 신청</h3>
      <p className="sub">네 가지만 남겨주시면 확인 후 연락드립니다.</p>
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
    <section className="contact" id="contact">
      <div className="contact-in">
        <div className="contact-l">
          <h2 className="rv">분석표 한 장부터<br />받아 보세요</h2>
          <p className="rv">상담료는 없고, 가입 권유 없이 분석표만 받고 끝내셔도 됩니다.</p>
          <FoldCard toast={toast} />
          <ul className="links">
            <li><a href={`sms:${P.mobile}?body=${encodeURIComponent('보장 점검 상담 문의드립니다')}`}><b>문자 보내기</b><span>{P.mobile}</span></a></li>
            <li><a href={P.map} target="_blank" rel="noopener"><b>오시는 길</b><span>{P.addr}</span></a></li>
            <li><div><b>상담 시간</b><span>{P.hours}</span></div></li>
          </ul>
        </div>
        <Form toast={toast} />
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
        <About />
        <Principles />
        <Sheet />
        <Life />
        <Check />
        <Faq />
        <Contact toast={toast} />
      </main>
      <footer className="ft">
        <p>굿리치 · 정소빈 보험설계사 · {P.addr}</p>
        <p>M {P.mobile} · T {P.tel} · F {P.fax} · {P.email}</p>
        <p>보험 계약 체결 전 상품설명서와 약관을 확인하시기 바랍니다. 분석표의 금액은 설명을 위한 예시입니다.</p>
      </footer>
      <nav className="dock" aria-label="빠른 연락">
        <a className="btn" href={`tel:${P.mobile}`}>전화 상담</a>
        <a className="btn line" href="#contact">무료 분석 신청</a>
      </nav>
      <div className={'toast' + (on ? ' on' : '')} role="status" aria-live="polite">{msg}</div>
    </>
  )
}
