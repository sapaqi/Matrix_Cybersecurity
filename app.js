const recipient = 'sales@matrixinternet.ie';

for (const form of document.querySelectorAll('.email-form')) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const email = fields.get('email').trim();
    const isReport = form.dataset.purpose === 'report';
    const subject = isReport ? 'Sample cybersecurity audit report' : 'Free cybersecurity consultation';
    const body = isReport
      ? `Hello Matrix,\n\nCould you send me your sample cybersecurity audit report?\n\nWork email: ${email}`
      : [
          'Hello Matrix,',
          '',
          'I’d like to arrange a free cybersecurity consultation.',
          '',
          `Name: ${fields.get('name').trim()}`,
          `Company: ${fields.get('company').trim()}`,
          `Role: ${fields.get('role').trim()}`,
          `Work email: ${email}`,
          `Privacy consent: ${fields.has('privacy') ? 'Yes' : 'No'}`,
          `Marketing opt-in: ${fields.has('marketing') ? 'Yes' : 'No'}`,
          '',
          fields.get('message').trim(),
        ].join('\n').trimEnd();

    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.hidden = false;
}

if ('IntersectionObserver' in window) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero-visual');
  const stat = document.querySelector('.stat');
  const statValue = stat.querySelector('.stat-value');
  const statFinal = statValue.textContent;
  const statTotal = Number(statFinal.replaceAll(',', ''));
  const formatNumber = new Intl.NumberFormat('en-IE');
  let statFrame = 0;
  let lastScrollY = window.scrollY;
  let scrollingDown = false;

  window.addEventListener('scroll', () => {
    const scrollY = Math.max(0, window.scrollY);
    if (scrollY === lastScrollY) return;
    scrollingDown = scrollY > lastScrollY;
    lastScrollY = scrollY;
  }, { passive: true });

  const reveal = new IntersectionObserver((entries) => {
    for (const { target, intersectionRatio } of entries) {
      if (intersectionRatio < 0.2) target.classList.remove('arrive');
      else if (scrollingDown && !motion.matches) target.classList.add('arrive');
    }
  }, { threshold: 0.2 });

  const revealTargets = '.section-intro, .risk-copy, .stat, .person, .team-support, .report-copy, .scope-grid article, .steps li, .timeline, .faq > div:first-child, .faq details, .contact-copy, .contact-form';
  for (const element of document.querySelectorAll(revealTargets)) reveal.observe(element);

  function resetCount() {
    cancelAnimationFrame(statFrame);
    statValue.textContent = statFinal;
  }

  function countStat() {
    const start = performance.now();
    function count(now) {
      const progress = Math.min(1, (now - start) / 1350);
      const eased = 1 - (1 - progress) ** 3;
      statValue.textContent = formatNumber.format(Math.round(statTotal * eased));
      if (progress < 1) statFrame = requestAnimationFrame(count);
    }
    statFrame = requestAnimationFrame(count);
  }

  const statObserver = new IntersectionObserver(([entry]) => {
    const visible = entry.intersectionRatio >= 0.4;
    stat.classList.toggle('in-view', visible);
    resetCount();
    if (visible && !motion.matches) countStat();
  }, { threshold: 0.4 });
  statObserver.observe(stat);
  motion.addEventListener('change', resetCount);

  const setParticleMotion = createHeroParticles(hero, motion);
  function syncParticles() {
    setParticleMotion(hero.classList.contains('in-view') && document.body.dataset.cubeLocation === 'hero');
  }
  createCubeJourney(hero, motion, syncParticles);
  const heroObserver = new IntersectionObserver(([entry]) => {
    hero.classList.toggle('in-view', entry.isIntersecting);
    if (entry.isIntersecting) hero.classList.add('has-entered');
    syncParticles();
  });
  heroObserver.observe(hero);

  const teamSupport = document.querySelector('.team-support');
  const teamObserver = new IntersectionObserver(([entry]) => {
    teamSupport.classList.toggle('cube-in-view', entry.intersectionRatio >= .1);
  }, { threshold: .1 });
  teamObserver.observe(teamSupport);
}

function createCubeJourney(hero, motion, onLocationChange) {
  const statDock = document.querySelector('[data-cube-dock=stat]');
  const traveller = document.querySelector('.cube-traveller');
  let frame = 0;

  function setLocation(location) {
    if (document.body.dataset.cubeLocation === location) return;
    document.body.dataset.cubeLocation = location;
    onLocationChange();
  }

  function centre(element) {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2, size: width };
  }

  function fly(from, to, progress) {
    const eased = progress ** 2 * (3 - 2 * progress);
    const shrink = 1 - (1 - progress) ** 3;
    const arc = Math.sin(Math.PI * progress);
    const x = from.x + (to.x - from.x) * eased;
    const y = from.y + (to.y - from.y) * progress - arc * 24;
    traveller.style.width = `${from.size + (to.size - from.size) * shrink}px`;
    traveller.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${-arc * 11}deg)`;
    setLocation('flight');
  }

  function update() {
    frame = 0;
    if (motion.matches) {
      setLocation('hero');
      return;
    }

    const scroll = Math.max(0, window.scrollY);
    const viewport = window.innerHeight;
    const from = centre(hero);
    const to = centre(statDock);
    const leaveHero = Math.max(0, scroll + from.y - viewport * .36);
    const landStat = Math.max(leaveHero + 90, scroll + to.y - viewport * .49);

    if (scroll <= leaveHero) setLocation('hero');
    else if (scroll < landStat) fly(from, to, (scroll - leaveHero) / (landStat - leaveHero));
    else setLocation('stat');
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  motion.addEventListener('change', schedule);
  document.fonts.ready.then(schedule);
  schedule();
}

function createHeroParticles(hero, motion) {
  const canvases = [...hero.querySelectorAll('canvas')];
  const contexts = canvases.map(canvas => canvas.getContext('2d'));
  if (contexts.some(context => !context)) return () => {};

  const cube = hero.querySelector('.cube');
  const colours = ['#ff6b27', '#ff9f5b', '#ffd4a8', '#f3d9bf'];
  const particles = Array.from({ length: 124 }, (_, index) => ({
    phase: index * 2.39996,
    radius: 0.39 + (index % 13) * 0.0075,
    lift: ((index * 7) % 23 - 11) / 390,
    size: 0.65 + (index % 9) / 7,
    colour: colours[index % colours.length],
  }));
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let angle = 0;
  let tilt = 0;
  let targetTilt = 0;
  let width = 0;
  let height = 0;

  function resize() {
    const bounds = canvases[0].getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    for (const [index, canvas] of canvases.entries()) {
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      contexts[index].setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }
  }

  function draw(now) {
    const delta = lastTime ? Math.min(now - lastTime, 40) : 0;
    lastTime = now;
    angle += delta * (0.00036 + Math.abs(tilt) * 0.00014);
    tilt += (targetTilt - tilt) * 0.04;
    for (const context of contexts) context.clearRect(0, 0, width, height);

    const scale = Math.max(0.75, width / 660);
    for (const particle of particles) {
      const phase = particle.phase + angle;
      const depth = Math.sin(phase);
      const context = contexts[depth > 0 ? 1 : 0];
      const x = Math.cos(phase) * width * particle.radius;
      const y = depth * height * particle.radius * (0.44 + tilt * 0.09) - x * 0.22;
      context.globalAlpha = (0.42 + depth * 0.24) * (0.78 + 0.22 * Math.cos(phase * 2 + particle.phase));
      context.fillStyle = particle.colour;
      context.beginPath();
      context.arc(width * 0.5 + x, height * (0.53 + particle.lift) + y, particle.size * scale * (1 + depth * 0.28), 0, Math.PI * 2);
      context.fill();
    }
    frame = requestAnimationFrame(draw);
  }

  function resetTilt() {
    targetTilt = 0;
    cube.style.removeProperty('--cube-x');
    cube.style.removeProperty('--cube-y');
  }

  function sync() {
    if (visible && !motion.matches) {
      if (!frame) {
        resize();
        frame = requestAnimationFrame(draw);
      }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      for (const context of contexts) context.clearRect(0, 0, width, height);
      resetTilt();
    }
  }

  hero.addEventListener('pointermove', (event) => {
    if (!frame || event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    targetTilt = x * 2;
    cube.style.setProperty('--cube-x', `${-y * 10}deg`);
    cube.style.setProperty('--cube-y', `${x * 12}deg`);
  });
  hero.addEventListener('pointerleave', resetTilt);
  motion.addEventListener('change', sync);
  new ResizeObserver(() => { if (frame) resize(); }).observe(hero);

  return (isVisible) => {
    visible = isVisible;
    sync();
  };
}
