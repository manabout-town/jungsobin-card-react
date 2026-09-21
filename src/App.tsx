import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type InputHTMLAttributes, type PointerEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import { CHECKS, FAQ, PRINCIPLES, PROFILE as P, SHEET, STAGES, STEPS, SUBMIT_URL } from './data'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches
const MOTION = '(prefers-reduced-motion: no-preference)'
const EASE = 'expo.out'
const won = (n: number) => n.toLocaleString('ko-KR')
let lenis: Lenis | null = null

const scrollToY = (y: number) => lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' })

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [ok, setOk] = useState(false)
  const [dead, setDead] = useState(false)
  if (dead) return null
  return <img className={(className ?? '') + (ok ? ' ok' : '')} src={src} alt={alt} decoding="async"
    onLoad={() => { setOk(true); ScrollTrigger.refresh() }} onError={() => setDead(true)} />
}

// 진입: 흩어진 증권 여섯 장이 날아와 한 장으로 겹쳐지고, 커튼처럼 걷힌다
const PAPERS = [[-62, -40, -24], [58, -46, 19], [-56, 44, 14], [64, 38, -17], [-8, -70, 8], [6, 66, -9]]

function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(RM)
  useGSAP(() => {
    if (RM) { onDone(); return }
    document.documentElement.classList.add('lock')
    lenis?.stop()
    const finish = () => {
      document.documentElement.classList.remove('lock')
      lenis?.start()
      setGone(true)
    }
    const tl = gsap.timeline({ onComplete: finish })
    tl.from('.pile i', { x: (k: number) => `${PAPERS[k][0]}vmin`, y: (k: number) => `${PAPERS[k][1]}vmin`, rotation: (k: number) => PAPERS[k][2] * 2, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.07 })
      .from('.intro p, .intro small', { y: 16, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.1 }, '-=.6')
      .to('.pile', { scale: 0.86, duration: 0.5, ease: 'power2.in' }, '+=.35')
      .add(onDone, '-=.1')
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '<')
    const skip = () => { if (tl.progress() < 0.72) tl.progress(0.72) }
    const evs = ['wheel', 'touchstart', 'keydown', 'click'] as const
    evs.forEach(e => addEventListener(e, skip, { once: true, passive: true }))
    const force = setTimeout(() => tl.progress(1), 4000) // 느린 망에서도 4초면 강제 개봉
    return () => { clearTimeout(force); evs.forEach(e => removeEventListener(e, skip)) }
  }, { scope: root })
  if (gone) return null
  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="pile">{PAPERS.map((_, k) => <i key={k} style={{ '--r': `${PAPERS[k][2] * 0.12}deg` } as CSSProperties} />)}</div>
      <p>흩어진 증권을 한 장으로</p>
      <small>정소빈 · 굿리치 보험설계사</small>
    </div>
  )
}

function Header() {
  const bar = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    gsap.to(bar.current, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })
  })
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

function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION, () => {
      gsap.set('.hero .hx', { opacity: 0, y: 24 })
      gsap.set('.hero-win', { clipPath: 'inset(100% 0 0 0)' })
      // 스크롤하면 창이 여백 없이 화면 끝까지 넓어지고 사진은 천천히 당겨진다
      gsap.fromTo('.hero-win', { '--inset': 'var(--pad)', '--rad': '6px' }, {
        '--inset': '0px', '--rad': '0px', ease: 'none',
        scrollTrigger: { trigger: '.hero-win', start: 'top 85%', end: 'top 15%', scrub: true },
      })
      gsap.fromTo('.hero-win img', { yPercent: -8, scale: 1.18 }, {
        yPercent: 8, scale: 1.04, ease: 'none',
        scrollTrigger: { trigger: '.hero-win', start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    return () => mm.revert()
  }, { scope: root })

  useGSAP(() => {
    if (!ready || RM) return
    const split = SplitText.create('.hero h1', { type: 'lines', mask: 'lines' })
    gsap.timeline({ delay: 0.15 })
      .from(split.lines, { yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.1 })
      .to('.hero .hx', { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08 }, '-=.9')
      .to('.hero-win', { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut' }, '-=1.1')
  }, { scope: root, dependencies: [ready] })

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-copy">
        <p className="who hx">정소빈 · 굿리치 보험설계사 · 부산 센텀</p>
        <h1>보험이 몇 개인지<br />세어 보셨나요?</h1>
        <div className="hero-sub">
          <p className="lead hx">가입한 증권을 전부 조회해<br />표 한 장으로 정리해 드립니다.</p>
          <div className="ctas hx">
            <a className="btn" href={`tel:${P.mobile}`}>전화 상담</a>
            <a className="btn line" href="#contact">무료 분석 신청</a>
          </div>
        </div>
      </div>
      <div className="hero-win">
        <div className="hero-mask"><Img src="/img/desk.jpg" alt="책상 위에 흩어진 보험 증권과 만년필" /></div>
      </div>
    </section>
  )
}

function About() {
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION, () => {
      gsap.fromTo('.about-pic', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.about-pic', start: 'top 80%' } })
      gsap.fromTo('.about-pic img', { scale: 1.25, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.about-pic', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.facts li', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: '.facts', start: 'top 88%' } })
    })
    return () => mm.revert()
  }, { scope: root })
  return (
    <section className="sec about" ref={root}>
      <figure className="about-pic">
        <Img src="/img/profile.jpg" alt="정소빈 설계사" />
      </figure>
      <div className="about-copy">
        <h2 className="sp">새로 드는 것보다<br />가진 걸 먼저 봅니다</h2>
        <p className="rv">굿리치 소속 보험설계사 정소빈입니다. 부산 센텀 사무실에서 대면으로, 멀리 계신 분은 화상으로 만납니다.
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

// 원칙: 카드가 차례로 위에 쌓이고, 아래 깔린 카드는 뒤로 물러난다
function Principles() {
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION, () => {
      const cards = gsap.utils.toArray<HTMLElement>('.pr')
      cards.slice(0, -1).forEach((c, k) => {
        gsap.to(c, {
          scale: 0.92 + k * 0.02, '--dim': 0.28, ease: 'none',
          scrollTrigger: { trigger: cards[k + 1], start: 'top 85%', end: 'top 30%', scrub: true },
        })
      })
    })
    return () => mm.revert()
  }, { scope: root })
  return (
    <section className="sec prin" ref={root}>
      <h2 className="sp">상담은 이 순서를<br />지킵니다</h2>
      <div className="pr-stack">
        {PRINCIPLES.map((p, k) => (
          <article key={p.t} className={'pr' + (k === 1 ? ' fill' : '')} style={{ '--i': k } as CSSProperties}>
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
    const o = { n: from.current }
    const tw = gsap.to(o, { n: target, duration: 0.9, ease: 'power3.out', onUpdate: () => setV(Math.round(o.n)), onComplete: () => { from.current = target } })
    return () => { tw.kill(); from.current = target }
  }, [target])
  return RM ? target : v
}

// 센터피스: 흩어진 증권이 표로 날아와 붙고, 스크롤하면 한 단계씩 정리된다
function Sheet() {
  const wrap = useRef<HTMLElement>(null)
  const [i, setI] = useState(0)
  const [pinned, setPinned] = useState(() => !RM && matchMedia('(min-height: 540px)').matches)

  useEffect(() => {
    if (RM) return
    const mq = matchMedia('(min-height: 540px)')
    const on = () => setPinned(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useGSAP(() => {
    if (!pinned) return
    ScrollTrigger.create({
      trigger: wrap.current, start: 'top top', end: 'bottom bottom',
      onUpdate: s => setI(Math.min(STEPS.length - 1, Math.floor(s.progress * STEPS.length))),
      onToggle: s => document.body.classList.toggle('in-pin', s.isActive),
    })
    const rows = gsap.utils.toArray<HTMLElement>('.rows li:not(.gap)')
    gsap.fromTo(rows, {
      x: () => gsap.utils.random(-260, 260), y: () => gsap.utils.random(-220, 160), rotation: () => gsap.utils.random(-28, 28),
      opacity: 0, scale: 1.15,
    }, {
      x: 0, y: 0, rotation: 0, opacity: 1, scale: 1, duration: 1.1, ease: EASE, stagger: 0.07, clearProps: 'transform,opacity',
      scrollTrigger: { trigger: wrap.current, start: 'top 55%', toggleActions: 'play none none reverse' },
    })
    gsap.fromTo('.paper', { y: 80, rotation: -3 }, { y: 0, rotation: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: wrap.current, start: 'top 70%', toggleActions: 'play none none reverse' } })
    return () => document.body.classList.remove('in-pin')
  }, { scope: wrap, dependencies: [pinned], revertOnUpdate: true })

  const go = (k: number) => {
    const el = wrap.current
    if (!pinned || !el) return setI(k)
    const top = el.getBoundingClientRect().top + scrollY
    scrollToY(top + ((k + 0.5) / STEPS.length) * (el.offsetHeight - innerHeight))
  }

  const before = SHEET.filter(r => !r.gap).reduce((a, r) => a + r.m, 0)
  const after = SHEET.filter(r => !r.dup).reduce((a, r) => a + (r.trim ? r.trim[1] : r.m), 0)
  const total = useCount(i >= 3 ? after : before)
  const s = STEPS[i]

  return (
    <section ref={wrap} id="sheet" className={'sheet' + (pinned ? ' pinned' : '')}
      style={pinned ? { height: `${STEPS.length * 80 + 100}svh` } : undefined}>
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
        <div className={'paper st' + i}>
          <div className="paper-hd">
            <b>보장 분석표</b>
            {i >= 2 && <span className="stamp" aria-hidden="true">점검 완료</span>}
          </div>
          <ul className="rows">
            {SHEET.map((r, k) => {
              const note = r.dup && i >= 1 ? r.dup : r.gap && i >= 2 ? '빠진 보장' : r.trim && i >= 3 ? r.trim[0] : ''
              const cut = !!r.trim && i >= 3
              return (
                <li key={r.n + r.co} style={{ '--k': k } as CSSProperties}
                  className={[r.dup && i >= 1 && 'dup', r.dup && i >= 3 && 'gone', r.gap && 'gap', r.gap && i >= 2 && 'show', cut && 'cut'].filter(Boolean).join(' ')}>
                  <span className="rn"><b>{r.n}</b>{note ? <small className="note">{note}</small> : <small>{r.co}</small>}</span>
                  <span className="amt">{cut && <s>{won(r.m)}</s>}<em key={String(cut)}>{won(cut ? r.trim![1] : r.m)}</em></span>
                </li>
              )
            })}
          </ul>
          <div className="paper-ft">
            <span>{i >= 3 ? '정리 후 월 보험료' : '지금 월 보험료'}
              <em aria-live="polite">{i >= 3 ? `보장 한 칸 늘고 월 ${won(before - after)}원 절감` : ''}</em></span>
            <strong>{won(total)}<small>원</small></strong>
          </div>
          <p className="paper-note">예시 금액 · 실제 고객 자료가 아닙니다</p>
        </div>
      </div>
    </section>
  )
}

// 나이별 보장: 세로 스크롤이 가로로 넘어가는 다섯 장의 사진 카드
function Life() {
  const root = useRef<HTMLElement>(null)
  const [act, setAct] = useState(0)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION, () => {
      const track = root.current!.querySelector<HTMLElement>('.life-track')!
      const dist = () => Math.max(0, track.scrollWidth - track.clientWidth + parseFloat(getComputedStyle(track).paddingLeft))
      root.current!.classList.add('hs')
      const tw = gsap.to(track.children, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.life-pin', pin: true, start: 'top top', end: () => '+=' + dist() * 1.1, scrub: 0.8, invalidateOnRefresh: true,
          // 카드 한 장이 왼쪽 여백에 딱 맞게 멈추도록 스냅
          snap: { snapTo: (v: number) => {
            const step = (track.children[0] as HTMLElement).offsetWidth + 14, d = dist()
            const pts = STAGES.map((_, k) => Math.min(1, (k * step) / d))
            return pts.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a))
          }, duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: 'power2.inOut' },
          onUpdate: s => setAct(Math.round(s.progress * (STAGES.length - 1))),
          onToggle: s => document.body.classList.toggle('in-pin', s.isActive),
        },
      })
      gsap.utils.toArray<HTMLElement>('.stage img').forEach(img => {
        gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } })
      })
      return () => root.current?.classList.remove('hs')
    })
    return () => mm.revert()
  }, { scope: root })
  return (
    <section className="life" id="life" ref={root}>
      <div className="life-pin">
        <div className="life-top">
          <h2 className="sp">나이가 바뀌면<br />먼저 볼 보장도 바뀝니다</h2>
          <ol className="ages" aria-hidden="true">
            {STAGES.map((x, k) => <li key={x.k} className={k === act ? 'on' : ''}>{x.k}</li>)}
          </ol>
        </div>
        <div className="life-track">
          {STAGES.map((s, k) => (
            <article key={s.k} className="stage">
              <Img src={`/img/age-${[20, 30, 40, 50, 60][k]}.jpg`} alt="" />
              <div className="stage-tx">
                <span className="age">{s.k}</span>
                <span className="tag">{s.tag} · {s.risk}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <ul className="cov" aria-label={`${s.k} 먼저 볼 보장`}>
                  {s.cov.map(([a, b]) => <li key={a}><span>{a}</span><b>{b}</b></li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
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
      <div className="check-hd">
        <h2 className="sp">내 보험,<br />여섯 가지만 확인해 보세요</h2>
        <p className="rv">아는 항목을 눌러 표시하세요. 세 개 이하라면 정리할 때입니다.</p>
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
        <strong key={n} className="pop">{n}<small> / 6</small></strong>
        <span>{verdict}</span>
        <a className="btn inv" href="#contact">분석표 받아보기</a>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section className="sec faq">
      <h2 className="sp">자주 받는 질문</h2>
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

// 명함 사물: 기울이면 빛이 스치고, 누르면 아래로 펼쳐져 연락처가 나온다
function FoldCard({ toast }: { toast: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  const t = open ? 0 : -1
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (RM || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / Math.min(r.height, r.width / 1.75)
    e.currentTarget.style.setProperty('--ry', `${(x - 0.5) * 12}deg`)
    e.currentTarget.style.setProperty('--rx', `${(0.5 - y) * 8}deg`)
    e.currentTarget.style.setProperty('--gx', `${x * 100}%`)
  }
  const reset = (e: PointerEvent<HTMLDivElement>) => { e.currentTarget.style.setProperty('--ry', '0deg'); e.currentTarget.style.setProperty('--rx', '0deg') }
  return (
    <div className={'fold' + (open ? ' open' : '')} onPointerMove={tilt} onPointerLeave={reset}>
      <div className="fold-in">
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
            <span className="sheen" aria-hidden="true" />
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
    <form className="form rv" onSubmit={submit} noValidate>
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

const MARQUEE = '가입 말고, 확인부터 · 흩어진 증권을 한 장으로 · 당일 가입 권유 없음 · '

function Contact({ toast }: { toast: (m: string) => void }) {
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION, () => {
      gsap.fromTo('.mq-in', { xPercent: 0 }, { xPercent: -50, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      gsap.fromTo('.contact-bg img', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    return () => mm.revert()
  }, { scope: root })
  return (
    <section className="contact" id="contact" ref={root}>
      <div className="contact-bg" aria-hidden="true"><Img src="/img/office.jpg" alt="" /></div>
      <div className="mq" aria-hidden="true"><div className="mq-in">{MARQUEE.repeat(4)}</div></div>
      <div className="contact-in">
        <div className="contact-l">
          <h2 className="sp">분석표 한 장부터<br />받아 보세요</h2>
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

// 스크롤 공통: 부드러운 관성 스크롤 + 제목 줄 단위 등장 + 요소 순차 등장
function useMotion() {
  useEffect(() => {
    if (RM) return
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -76 } })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis?.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(raf); lenis?.destroy(); lenis = null }
  }, [])
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION, () => {
      gsap.set('.rv', { opacity: 0, y: 28 })
      ScrollTrigger.batch('.rv', {
        start: 'top 90%', once: true,
        onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08 }),
      })
      gsap.utils.toArray<HTMLElement>('.sp').forEach(el => {
        SplitText.create(el, {
          type: 'lines', mask: 'lines', autoSplit: true,
          onSplit: self => gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: EASE, stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
        })
      })
    })
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => mm.revert()
  })
}

export default function App() {
  const [msg, setMsg] = useState('')
  const [on, setOn] = useState(false)
  const [ready, setReady] = useState(RM)
  const tRef = useRef<number>(0)
  const toast = (m: string) => { setMsg(m); setOn(true); clearTimeout(tRef.current); tRef.current = setTimeout(() => setOn(false), 2400) }
  useMotion()
  return (
    <>
      <Intro onDone={() => setReady(true)} />
      <Header />
      <main>
        <Hero ready={ready} />
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
        <p>보험 계약 체결 전 상품설명서와 약관을 확인하시기 바랍니다. 분석표의 금액은 설명을 위한 예시이며, 프로필 외 사진은 연출 이미지입니다.</p>
      </footer>
      <nav className="dock" aria-label="빠른 연락">
        <a className="btn" href={`tel:${P.mobile}`}>전화 상담</a>
        <a className="btn line" href="#contact">무료 분석 신청</a>
      </nav>
      <div className={'toast' + (on ? ' on' : '')} role="status" aria-live="polite">{msg}</div>
    </>
  )
}
