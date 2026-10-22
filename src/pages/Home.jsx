import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Store } from '../data/store';
import { useSettings } from '../data/settingsContext';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const { stats = [], legacyTitle, legacyDescription } = useSettings();
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && (window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024))
  );

  const heroLogoCanvasRef = useRef(null);
  const legacyCanvasRef = useRef(null);
  const statsContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024));
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Three.js Hero 3D Logo Canvas (Desktop Only - Mobile gets lightweight instant logo)
  useEffect(() => {
    if (isMobile) return;
    const canvas = heroLogoCanvasRef.current;
    if (!canvas) return;

    const w = canvas.clientWidth || 280;
    const h = canvas.clientHeight || 280;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;

    // --- Dedicated Spotlight System for the Logo Model ---
    // Powerful center spotlight aimed directly at the model
    const stageSpotLight = new THREE.SpotLight(0xffffff, 18, 25, Math.PI / 4, 0.45, 1.2);
    stageSpotLight.position.set(0, 4, 5);
    scene.add(stageSpotLight);

    // Front high-clarity key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
    keyLight.position.set(3, 4, 6);
    scene.add(keyLight);

    // Warm orange rim spotlight
    const rimLightOrange = new THREE.SpotLight(0xff7722, 14, 20, Math.PI / 3, 0.5);
    rimLightOrange.position.set(-4, 2, 4);
    scene.add(rimLightOrange);

    // Cool purple rim spotlight
    const rimLightPurple = new THREE.SpotLight(0xa855f7, 14, 20, Math.PI / 3, 0.5);
    rimLightPurple.position.set(4, -2, 4);
    scene.add(rimLightPurple);

    // Rich ambient light so no angle is pitch-black
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

    const pLightOrange = new THREE.PointLight(0xef6522, 5, 15);
    pLightOrange.position.set(-2.5, 1.5, 3);
    scene.add(pLightOrange);

    const pLightPurple = new THREE.PointLight(0x8b5cf6, 5, 15);
    pLightPurple.position.set(2.5, -1.5, 3);
    scene.add(pLightPurple);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    stageSpotLight.target = rootGroup;

    // Load Hero 3D Logo model from public/logo.glb
    let logoMesh = null;
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/logo.glb',
      (gltf) => {
        logoMesh = gltf.scene;
        const box = new THREE.Box3().setFromObject(logoMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 2.6 / (maxDim || 1);
        logoMesh.scale.set(targetScale, targetScale, targetScale);
        logoMesh.position.sub(center.clone().multiplyScalar(targetScale));

        logoMesh.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = 0.25;
            child.material.metalness = 0.5;
            child.material.needsUpdate = true;
          }
        });

        rootGroup.add(logoMesh);
      },
      undefined,
      (err) => {
        console.warn('Error loading /logo.glb:', err);
        // Procedural modern polyhedral tech emblem
        const geom = new THREE.IcosahedronGeometry(1.2, 1);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xef6522,
          roughness: 0.15,
          metalness: 0.8,
          wireframe: true,
        });
        const innerGeom = new THREE.OctahedronGeometry(0.75, 0);
        const innerMat = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          roughness: 0.1,
          metalness: 0.9,
        });
        const outerMesh = new THREE.Mesh(geom, mat);
        const innerMesh = new THREE.Mesh(innerGeom, innerMat);
        rootGroup.add(outerMesh);
        rootGroup.add(innerMesh);
      }
    );

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const t = clock.getElapsedTime();

      if (rootGroup) {
        // Faster, smoother and more dynamic rotation
        const tgtY = t * 0.85 + mouseX * 0.75;
        const tgtX = mouseY * 0.45;
        rootGroup.rotation.y += (tgtY - rootGroup.rotation.y) * 0.09;
        rootGroup.rotation.x += (tgtX - rootGroup.rotation.x) * 0.09;
        rootGroup.position.y = Math.sin(t * 1.6) * 0.08;
      }

      const pulse = Math.sin(t * 2.2) * 1.5 + 4.5;
      pLightOrange.intensity = pulse;
      pLightPurple.intensity = pulse;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      dracoLoader.dispose();
      renderer.dispose();
    };
  }, []);

  // Three.js Legacy 3D Canvas
  useEffect(() => {
    const canvas = legacyCanvasRef.current;
    if (!canvas) return;

    const w = canvas.clientWidth || 450;
    const h = canvas.clientHeight || 450;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const pLight1 = new THREE.PointLight(0xef6522, 3.5, 25);
    pLight1.position.set(3, 3, 4);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0x8b5cf6, 3.5, 25);
    pLight2.position.set(-3, -2, 4);
    scene.add(pLight2);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const group = new THREE.Group();
    scene.add(group);

    let hasLoadedModel = false;
    let dracoLoader = null;

    const loadModel = () => {
      if (hasLoadedModel) return;
      hasLoadedModel = true;

      const loader = new GLTFLoader();
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        '/legacy.glb',
        (gltf) => {
          const modelMesh = gltf.scene;
          const box = new THREE.Box3().setFromObject(modelMesh);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2.8 / (maxDim || 1);
          modelMesh.scale.set(scale, scale, scale);
          modelMesh.position.sub(center.multiplyScalar(scale));

          modelMesh.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material.roughness = 0.25;
              child.material.metalness = 0.8;
              child.material.needsUpdate = true;
            }
          });

          group.add(modelMesh);
        },
        undefined,
        (err) => {
          console.warn('Error loading /legacy.glb:', err);
          // Procedural futuristic mesh fallback
          const geom = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
          const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.85,
          });
          const knot = new THREE.Mesh(geom, mat);
          group.add(knot);
        }
      );
    };

    // Interactive Scroll & Cursor Driven Rotation (No Auto-Spin)
    let scrollRotationY = 0;
    let scrollRotationX = 0;
    let cursorRotationX = 0;
    let cursorRotationY = 0;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let mouseX = 0, mouseY = 0;

    // ScrollTrigger to rotate the model as the user scrolls past the Legacy section
    const stInstance = ScrollTrigger.create({
      trigger: '.legacy',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.8,
      onUpdate: (self) => {
        scrollRotationY = self.progress * Math.PI * 2.2;
        scrollRotationX = (self.progress - 0.5) * 0.35;
      },
    });

    // Window mouse move hover tracking (only when legacy canvas is visible)
    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          loadModel();
        }
      },
      { threshold: 0.05, rootMargin: '300px' }
    );
    observer.observe(canvas);

    const handleMouseMoveLegacy = (e) => {
      if (!isVisible) return;
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMoveLegacy, { passive: true });

    // Direct cursor click & drag on canvas to rotate
    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMoveCanvas = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      cursorRotationY += deltaX * 0.009;
      cursorRotationX += deltaY * 0.009;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support for mobile dragging
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      cursorRotationY += deltaX * 0.009;
      cursorRotationX += deltaY * 0.009;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMoveCanvas);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      // Only rotates on scroll progress + cursor hover / drag interaction
      const targetY = scrollRotationY + cursorRotationY + mouseX * 0.45;
      const targetX = scrollRotationX + cursorRotationX + mouseY * 0.35;

      group.rotation.y += (targetY - group.rotation.y) * 0.08;
      group.rotation.x += (targetX - group.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      observer.disconnect();
      stInstance.kill();
      window.removeEventListener('mousemove', handleMouseMoveLegacy);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMoveCanvas);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animId);
      if (dracoLoader) {
        dracoLoader.dispose();
      }
      renderer.dispose();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // About Section
      gsap.to('#aboutHeading', {
        scrollTrigger: { trigger: '.about', start: 'top 75%', end: 'top 40%', scrub: 0.4 },
        opacity: 1,
        y: 0,
      });
      gsap.to('#aboutDesc', {
        scrollTrigger: { trigger: '.about', start: 'top 65%', end: 'top 30%', scrub: 0.4 },
        opacity: 1,
        y: 0,
      });
      gsap.to('#aboutDivider', {
        scrollTrigger: { trigger: '#aboutDivider', start: 'top 85%', end: 'top 60%', scrub: 0.4 },
        width: '120px',
      });

      // Explore Cards Stagger
      gsap.from('.explore__card', {
        scrollTrigger: { trigger: '.explore', start: 'top 80%' },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'transform',
      });

      // Legacy Section
      gsap.to('#legacyTitle', {
        scrollTrigger: { trigger: '.legacy', start: 'top 80%', end: 'top 50%', scrub: 0.5 },
        opacity: 1,
        y: 0,
      });
      gsap.to('#legacyDesc', {
        scrollTrigger: { trigger: '.legacy', start: 'top 70%', end: 'top 40%', scrub: 0.5 },
        opacity: 1,
        y: 0,
      });
      gsap.to('#legacyVisual', {
        scrollTrigger: { trigger: '.legacy', start: 'top 75%', end: 'top 35%', scrub: 0.5 },
        opacity: 1,
        scale: 1,
      });

      // FAQ Section
      gsap.to('#faqTitle', {
        scrollTrigger: { trigger: '.faq', start: 'top 80%' },
        opacity: 1,
        y: 0,
        duration: 0.8,
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    Store.getFaqs().then(setFaqs);
  }, []);

  // Stats and FAQs come from Sanity after mount, and both start hidden in CSS, so their reveal
  // tweens are (re)built whenever that content changes. A mount-only tween would miss them.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.legacy__stat', {
        scrollTrigger: { trigger: '.legacy', start: 'top 80%' },
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out',
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [stats]);

  useEffect(() => {
    if (!faqs.length) return;
    const ctx = gsap.context(() => {
      gsap.to('.faq__item', {
        scrollTrigger: { trigger: '.faq', start: 'top 80%' },
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [faqs]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="home-page">
      {/* ========== SECTION 1 — HERO ========== */}
      <section className="hero" id="hero">
        <div className="hero__video-wrap">
          <video
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            src="/background.mp4"
            onError={(e) => {
              console.warn('Could not load background video:', e);
            }}
          />
          <div className="hero__overlay" id="heroOverlay" />
        </div>

        <div className="hero__glow" aria-hidden="true">
          <div className="hero__glow-orb hero__glow-orb--orange" />
          <div className="hero__glow-orb hero__glow-orb--purple" />
        </div>

        <div className="hero__content">
          <div className="hero__logo-wrap">
            <div className="hero__logo-spotlight" />
            {isMobile ? (
              <img src="/logo.png" alt="VECODERS Logo" className="hero__mobile-logo" />
            ) : (
              <canvas className="hero__logo-canvas" ref={heroLogoCanvasRef} id="heroLogoCanvas" />
            )}
          </div>
          <img
            src="/vec.png"
            alt="VECODERS"
            className="hero__title-img"
            id="heroTitle"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="hero__tagline-pill" id="heroTagline">
            <p className="hero__tagline">
              Beyond <span className="accent">Code</span>. Beyond <span className="accent">Limits</span>.
            </p>
          </div>
        </div>

        {/* Hero corners */}
        <div className="hero__corner hero__corner--left">
          <div className="hero__corner-line" />
          <div className="hero__corner-label"><span className="dot" /> Innovate</div>
          <p className="hero__corner-desc">Lightning-fast ideas turning technical challenges into breakthrough real-world solutions.</p>
        </div>

        <div className="hero__corner hero__corner--right">
          <div className="hero__corner-line" />
          <div className="hero__corner-label"><span className="dot" /> Collaborate</div>
          <p className="hero__corner-desc">The collective strength and determination pushing student creators to reach infinity.</p>
        </div>

        <div className="scroll-indicator" id="scrollIndicator">
          <span className="scroll-indicator__text">Scroll</span>
          <span className="scroll-indicator__arrow" />
        </div>
      </section>

      {/* ========== SECTION 2 — ABOUT ========== */}
      <section className="about" id="about">
        <div className="about__glow" aria-hidden="true" />
        <div className="container">
          <div className="about__inner">
            <div className="section-label" id="aboutLabel">
              <span className="section-label__dot" />
              <span className="section-label__text">Know Us</span>
              <span className="section-label__dot" />
            </div>
            <h2 className="about__heading" id="aboutHeading">EXPLORE THE WORLD OF VECODERS</h2>
            <p className="about__desc" id="aboutDesc">
              Anchored by a shared vision of technological excellence, VECODERS is a student-driven
              technology community dedicated to innovation, collaboration, and real-world problem solving
              through development, artificial intelligence, design, and engineering. We bridge the gap
              between academic learning and industry practice, empowering the next generation of
              creators and innovators.
            </p>
            <div className="about__divider" id="aboutDivider" />
          </div>
        </div>
      </section>

      {/* ========== SECTION 3 — EXPLORE CARDS ========== */}
      <section className="explore" id="explore">
        <div className="container">
          {/* Top row: 2 large cards */}
          <div className="explore__grid-2" id="exploreGrid2">
            <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="explore__card">
                <img src="/about us.png" alt="About Us" className="explore__card-bg" loading="lazy" />
                <div className="explore__card-overlay" />
                <div className="explore__card-content">
                  <h3 className="explore__card-title">About Us</h3>
                  <p className="explore__card-desc">Learn about VECODERS, our journey, vision, and the team that makes it all possible.</p>
                </div>
              </div>
            </Link>
            <Link to="/achievements" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="explore__card">
                <img src="/records.png" alt="Records & Milestones" className="explore__card-bg" loading="lazy" />
                <div className="explore__card-overlay" />
                <div className="explore__card-content">
                  <h3 className="explore__card-title">Records & Milestones</h3>
                  <p className="explore__card-desc">Explore all the amazing records and achievements VECODERS has accomplished over the years.</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom row: 3 smaller cards */}
          <div className="explore__grid-3" id="exploreGrid3">
            <Link to="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="explore__card">
                <img src="/blogs.png" alt="Blogs" className="explore__card-bg" loading="lazy" />
                <div className="explore__card-overlay" />
                <div className="explore__card-content">
                  <h3 className="explore__card-title">Blogs</h3>
                  <p className="explore__card-desc">Read stories, insights, and experiences shared by our team and members.</p>
                </div>
              </div>
            </Link>
            <Link to="/events" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="explore__card">
                <img src="/workshop.png" alt="Workshops" className="explore__card-bg" loading="lazy" />
                <div className="explore__card-overlay" />
                <div className="explore__card-content">
                  <h3 className="explore__card-title">Workshops</h3>
                  <p className="explore__card-desc">Hands-on sessions on AI/ML, web development, cloud computing, and more.</p>
                </div>
              </div>
            </Link>
            <Link to="/events" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="explore__card">
                <img src="/events.png" alt="Events" className="explore__card-bg" loading="lazy" />
                <div className="explore__card-overlay" />
                <div className="explore__card-content">
                  <h3 className="explore__card-title">Events</h3>
                  <p className="explore__card-desc">Get details about hackathons, coding competitions, and tech talks at VECODERS.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4 — OUR LEGACY ========== */}
      <section className="legacy" id="legacy">
        <div className="legacy__glow" aria-hidden="true">
          <div className="legacy__glow-orb legacy__glow-orb--red" />
          <div className="legacy__glow-orb legacy__glow-orb--orange" />
          <div className="legacy__glow-orb legacy__glow-orb--white" />
        </div>

        <div className="container">
          <div className="legacy__content">
            <div className="legacy__visual" id="legacyVisual">
              <canvas className="legacy__3d-canvas" ref={legacyCanvasRef} id="legacyCanvas" />
            </div>
            <div className="legacy__text">
              <h2 className="legacy__title" id="legacyTitle">{legacyTitle}</h2>
              <p className="legacy__desc" id="legacyDesc">{legacyDescription}</p>
              <div className="legacy__stats" id="legacyStats" ref={statsContainerRef}>
                {stats.map((stat, i) => (
                  <div className="legacy__stat" key={i}>
                    <div className="legacy__stat-number">{stat.value}</div>
                    <div className="legacy__stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '32px' }}>
                <Link to="/timeline" className="btn-primary">Explore our Timeline</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 7 — FAQ ========== */}
      <section className="faq" id="faq">
        <div className="container">
          <h2 className="faq__title" id="faqTitle">Frequently Asked Questions</h2>

          <div className="faq__list" id="faqList">
            {faqs.map((item, index) => (
              <FaqItem key={item.id} item={item} isOpen={openFaq === index} onToggle={() => toggleFaq(index)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className={`faq__item ${isOpen ? 'active' : ''}`}>
      <button className="faq__question" aria-expanded={isOpen} onClick={onToggle}>
        <span>{item.question}</span>
        <svg
          className="faq__chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="faq__answer">
        <div className="faq__answer-clip">
          <div className="faq__answer-inner">{item.answer}</div>
        </div>
      </div>
    </div>
  );
}
