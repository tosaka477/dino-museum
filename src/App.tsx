import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  usePresence,
  type Variants,
} from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Bone,
  Dna,
  Gem,
  Leaf,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import TargetCursor from "./components/TargetCursor";

/* ---------------------------------- 数据 ---------------------------------- */

// 媒体资源：原 Cloudinary URL 返回 401 无法公开访问，已替换为本地生成资源
const chaptersData = [
  { name: "恐龙时代", image: "/media/chapter-1.jpg" },
  { name: "远古生命化石", image: "/media/chapter-2.jpg" },
  { name: "中生代爬行动物", image: "/media/chapter-3.jpg" },
  { name: "海洋化石馆", image: "/media/chapter-4.jpg" },
  { name: "史前巨兽", image: "/media/chapter-5.jpg" },
];

const SKETCH_URL = "/media/hero-sketch.jpg";
const SKELETON_VIDEO_URL = "/media/trex-walk.webm";
const PTERO_VIDEO_URL = "/media/ptero-fly.webm";

const navLinks = ["参观", "展览", "探索", "学习", "关于"];

const pills: { icon: LucideIcon; label: string }[] = [
  { icon: Bone, label: "恐龙" },
  { icon: Dna, label: "远古生命" },
  { icon: Gem, label: "矿物" },
  { icon: Leaf, label: "化石" },
  { icon: BookOpen, label: "了解更多" },
];

/* --------------------------------- 动画变体 --------------------------------- */

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const letterBlock: Variants = {
  initial: { y: 120, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* --------------------------- SandTransitionImage --------------------------- */
// 使用 SVG 滤镜链（feTurbulence + feDisplacementMap + feOffset + feGaussianBlur
// + feColorMatrix）实现沙粒 / 溶解过渡效果的图片组件。
// 通过 usePresence 感知 AnimatePresence 的进出场状态：
//   进入 = 四次方 ease-out（扭曲度 1 → 0）
//   退出 = 三次方 ease-in（扭曲度 0 → 1），结束后调用 safeToRemove
function SandTransitionImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const filterId = useRef(`sand-${Math.random().toString(36).slice(2, 9)}`);
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const offsetRef = useRef<SVGFEOffsetElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const matrixRef = useRef<SVGFEColorMatrixElement | null>(null);

  useEffect(() => {
    const entering = isPresent;
    const duration = 620;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = entering ? 1 - Math.pow(1 - t, 4) : Math.pow(t, 3);
      const d = entering ? 1 - eased : eased; // 当前扭曲程度 0 → 1
      dispRef.current?.setAttribute("scale", (d * 150).toFixed(2));
      offsetRef.current?.setAttribute("dy", (d * (entering ? -80 : 120)).toFixed(2));
      offsetRef.current?.setAttribute("dx", (d * (entering ? -30 : 30)).toFixed(2));
      blurRef.current?.setAttribute("stdDeviation", (d * 6).toFixed(2));
      const alpha = Math.max(0, 1 - d * 1.2).toFixed(3);
      matrixRef.current?.setAttribute(
        "values",
        `1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${alpha} 0`
      );
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!entering) {
        safeToRemove();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPresent, safeToRemove]);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id={filterId.current} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.8"
            numOctaves="4"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="noise"
            scale={isPresent ? 150 : 0}
            xChannelSelector="R"
            yChannelSelector="G"
            result="disp"
          />
          <feOffset
            ref={offsetRef}
            in="disp"
            dx={isPresent ? -30 : 0}
            dy={isPresent ? -80 : 0}
            result="off"
          />
          <feGaussianBlur
            ref={blurRef}
            in="off"
            stdDeviation={isPresent ? 6 : 0}
            result="blur"
          />
          <feColorMatrix
            ref={matrixRef}
            in="blur"
            type="matrix"
            values={
              isPresent
                ? "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 0"
                : "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
            }
          />
        </filter>
      </svg>
      <img
        src={src}
        alt={alt}
        className={className}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        style={{ filter: `url(#${filterId.current})` }}
      />
    </>
  );
}

/* ------------------------------ 自定义叶片图标 ------------------------------ */

function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      <path d="M7.5 19c1.2-0.9 2.8-1 4.5-0.2" />
      <path d="M11.5 14.5c1.2-1.4 3-1.9 4.8-1.4" />
    </svg>
  );
}

/* --------------------------------- 主组件 --------------------------------- */

export default function App() {
  const [activeChapter, setActiveChapter] = useState(2); // 初始为「中生代爬行动物」
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 首屏滚动视差：骨架视频随滚动播放（骨架自行向左走出画面），素描背景右移淡出
  const heroRef = useRef<HTMLElement>(null);
  const [heroProgress, setHeroProgress] = useState(0);
  const skelVideoRef = useRef<HTMLVideoElement | null>(null);
  const pteroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = heroRef.current;
      if (el) {
        const h = el.offsetHeight || 1;
        setHeroProgress(Math.min(1, Math.max(0, window.scrollY / h)));
      }
      // 翼龙视频滚动驱动：元素顶部从视口底部滑入的进度映射为视频时间轴，
      // 翼龙从远处飞来，滚动到位后停在画面中
      const v = pteroVideoRef.current;
      if (v && v.duration) {
        const r = v.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
        const target = p * Math.max(0, v.duration - 0.04);
        if (Math.abs(v.currentTime - target) > 1 / 30) {
          v.currentTime = target;
        }
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const sketchStyle = {
    transform: `translateX(${heroProgress * 28}%)`,
    opacity: Math.max(0, 1 - heroProgress / 0.8),
  };

  // 滚动驱动骨架视频：滚动进度映射为视频时间轴，骨架向左自然走动直至出画
  useEffect(() => {
    const v = skelVideoRef.current;
    if (!v || !v.duration) return;
    const target = heroProgress * Math.max(0, v.duration - 0.04);
    if (Math.abs(v.currentTime - target) > 1 / 30) {
      v.currentTime = target;
    }
  }, [heroProgress]);

  // 每 3500ms 自动轮换章节（手动点击后重新计时）
  useEffect(() => {
    const id = setInterval(
      () => setActiveChapter((prev) => (prev + 1) % chaptersData.length),
      3500
    );
    return () => clearInterval(id);
  }, [activeChapter]);

  const current = String(activeChapter + 1).padStart(2, "0");

  return (
    <main className="relative w-full bg-[#EBEBEB] text-[#111] font-sans overflow-x-hidden">
      {/* 全局准星光标（括号锁定可交互元素，触屏设备自动禁用） */}
      <TargetCursor spinDuration={2.5} hideDefaultCursor parallaxOn />
      {/* ============================ SECTION 1: HERO ============================ */}
      <section
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col overflow-hidden"
      >
        {/* 1D 素描背景（滚轮下滑时右移并淡出） */}
        <div
          style={sketchStyle}
          className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        >
          <motion.img
            src={SKETCH_URL}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="w-full h-full object-cover select-none"
          />
        </div>

        {/* 1E 骨架视频（载入渐显；滚动驱动播放，骨架向左自然走出画面） */}
        <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
          <div className="absolute left-[-5vw] top-[19vh] md:top-[26vh] w-[110vw] will-change-transform">
            <motion.video
              ref={skelVideoRef}
              src={SKELETON_VIDEO_URL}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 2.4,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.5,
              }}
              onLoadedMetadata={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
              className="w-full h-auto select-none"
              aria-label="霸王龙骨架行走影像"
            />
          </div>
        </div>

        {/* 1A HEADER（NHM 标志） */}
        <motion.header
          className="pt-6 px-6 md:px-16 z-20"
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
        >
          <motion.h1
            className="w-full"
            variants={{
              initial: { scale: 1.03 },
              animate: {
                scale: 1,
                transition: {
                  staggerChildren: 0.06,
                  delayChildren: 0.1,
                  duration: 1.2,
                  ease: easeOutExpo,
                },
              },
            }}
          >
            <svg
              viewBox="0 0 840 100"
              className="w-full h-auto fill-[#111]"
              role="img"
              aria-label="NHM"
            >
              {/* 字母 N */}
              <g transform="translate(0,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="200,0 214,0 214,100 200,100" />
                <motion.polygon variants={letterBlock} points="0,0 33,0 214,100 181,100" />
              </g>
              {/* 字母 H */}
              <g transform="translate(280,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="200,0 214,0 214,100 200,100" />
                <motion.polygon variants={letterBlock} points="14,43 200,43 200,57 14,57" />
              </g>
              {/* 字母 M */}
              <g transform="translate(560,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="266,0 280,0 280,100 266,100" />
                <motion.polygon variants={letterBlock} points="0,0 26,0 153,100 127,100" />
                <motion.polygon variants={letterBlock} points="254,0 280,0 153,100 127,100" />
              </g>
            </svg>
          </motion.h1>

          {/* 1B 副导航栏 */}
          <div className="flex justify-between items-start mt-8 text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase">
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-[15%] text-gray-800 leading-relaxed"
            >
              <p>自然</p>
              <p>历史</p>
              <p>博物馆</p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hidden md:flex w-[5%] justify-center pt-1"
            >
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </motion.div>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 md:flex-none md:w-[30%] text-gray-800 leading-relaxed font-mono"
            >
              <span className="hidden md:block">
                以科学、发现与惊叹，
                <br />
                探索地球生命
                <br />
                的故事。
              </span>
              <span className="block md:hidden">
                以科学、发现
                <br />
                与惊叹，探索
                <br />
                地球生命
                <br />
                的故事。
              </span>
            </motion.div>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hidden md:flex w-[5%] justify-center pt-1"
            >
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </motion.div>
            <motion.nav
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hidden md:flex w-[15%] flex-col items-end gap-1 text-gray-800"
            >
              {navLinks.map((l) => (
                <a
                  key={l}
                  href="#"
                  className="cursor-target hover:text-black hover:underline transition-colors"
                >
                  {l}
                </a>
              ))}
            </motion.nav>
            {/* 汉堡按钮 */}
            <motion.button
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="菜单"
              className="md:hidden group relative z-[60] flex flex-col gap-[6px] p-2 -m-2"
            >
              <span
                className={`block w-8 h-[1.5px] bg-black transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "rotate-45 translate-y-[3.75px]"
                    : "group-hover:w-6"
                }`}
              />
              <span
                className={`block w-8 h-[1.5px] bg-black transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "-rotate-45 -translate-y-[3.75px]"
                    : "group-hover:w-10"
                }`}
              />
            </motion.button>
          </div>
        </motion.header>

        {/* 1C 移动端菜单浮层 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="md:hidden relative z-30 bg-[#EBEBEB] border-b border-gray-200 shadow-xl px-6 py-10"
            >
              <nav className="flex flex-col space-y-6 text-sm font-mono tracking-[0.2em] uppercase text-gray-800">
                {navLinks.map((l) => (
                  <a
                    key={l}
                    href="#"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="cursor-target hover:text-black transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 内容行：左侧栏 + 右侧栏 */}
        <div className="relative z-10 flex-1 flex justify-between w-full">
          {/* 1E 左侧栏内容 */}
          <motion.div
            className="px-10 md:px-16 mt-[13rem] md:mt-[15rem] w-[320px]"
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } },
            }}
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-4 text-xs font-mono mb-6"
            >
              <span>01</span>
              <span className="block w-16 h-[1.5px] bg-black/20" />
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-[3.5rem] md:text-[4rem] font-normal tracking-tight leading-[1] mb-6"
            >
              永恒的
              <br />
              奇迹
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[13px] md:text-[14px] text-gray-700 w-[240px] leading-[1.6] mb-6"
            >
              走进自然世界，
              <br />
              探索那些书写于
              <br />
              亿万年前的故事。
            </motion.p>
            <motion.button
              variants={fadeUp}
              className="group relative flex items-center gap-3 overflow-hidden bg-[#1a1a1a] px-6 py-3.5 border border-[#1a1a1a] rounded-md shadow-sm transition-all duration-300 hover:-translate-y-[0.5px] hover:shadow-[3px_3px_0px_rgba(17,17,17,0.5)] active:translate-y-0 active:shadow-sm"
            >
              <span className="absolute inset-0 bg-[#EBEBEB] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <LeafMark className="relative z-10 w-5 h-5 text-white transition-all duration-500 group-hover:text-[#111] group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-y-1" />
              <span className="relative z-10 text-[15px] font-medium text-white transition-colors duration-500 group-hover:text-[#111]">
                立即探索
              </span>
            </motion.button>
          </motion.div>

          {/* 1F 右侧栏（移动端隐藏） */}
          <motion.aside
            className="hidden md:flex flex-col w-[200px] mt-12 md:mt-20 mr-10 md:mr-16"
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } },
            }}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <h3 className="text-[10px] font-bold font-mono tracking-widest uppercase mb-2">
                霸王龙
              </h3>
              <p className="text-[12px] text-gray-600 leading-[1.6]">
                白垩纪晚期
                <br />
                6800 万—6600 万年前
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex gap-10 mb-10">
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">
                  体长
                </p>
                <p className="text-[13px] font-medium">12.3 米</p>
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">
                  身高
                </p>
                <p className="text-[13px] font-medium">4.0 米</p>
              </div>
            </motion.div>
            <motion.button variants={fadeUp} className="group flex items-center gap-3">
              <span className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center transition-all duration-300 group-hover:border-black group-hover:bg-[#111]">
                <Plus
                  size={16}
                  strokeWidth={1.5}
                  className="text-gray-700 transition-colors duration-300 group-hover:text-white"
                />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                查看详情
              </span>
            </motion.button>
          </motion.aside>
        </div>

        {/* 1G 左下角「向下滚动探索」 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 right-8 md:right-16 hidden md:flex items-center gap-4 z-10"
        >
          <span className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center gap-[4px]">
            <span className="block w-[1px] h-[12px] bg-gray-600" />
            <span className="block w-[1px] h-[12px] bg-gray-600" />
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold">
            向下滚动探索
          </span>
        </motion.div>
      </section>

      {/* ====================== SECTION 2: 探索我们的世界 ====================== */}
      <section className="relative w-full min-h-[75vh] md:min-h-screen bg-[#EBEBEB] flex flex-col items-center pt-24 md:pt-32 pb-0 z-20">
        {/* 2A 区块标签 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] mb-12 px-6 text-center"
        >
          <span className="text-gray-500">[02]</span>{" "}
          <span className="text-gray-900 font-bold uppercase">探索我们的世界</span>
        </motion.p>

        {/* 2B 主标题 */}
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: easeOutExpo }}
          className="text-[2.2rem] md:text-[3.5rem] lg:text-[4.2rem] leading-[1.1] font-medium tracking-tight text-[#111] max-w-[1000px] text-center px-6"
        >
          透过化石、矿物与远古奇迹，
          <br className="hidden md:block" />
          发掘我们星球过往的故事。
        </motion.h2>

        {/* 2C 操作胶囊 */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
          }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mt-14 md:mt-20 mb-10 md:mb-24 px-6"
        >
          {pills.map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              className="cursor-target flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-[11px] font-medium uppercase tracking-wider bg-white/50 backdrop-blur-sm text-gray-800 transition-colors duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* 2D 占位区（为翼龙视频向上重叠留白） */}
        <div className="min-h-[140px] md:min-h-[340px]" />

        {/* 2E 底部文字 */}
        <div className="absolute bottom-0 left-0 w-full px-8 md:px-16 pb-8 md:pb-12 pointer-events-none hidden md:flex justify-between">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            我们不只是讲述故事。
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            古生物学 (C) 2026
          </span>
        </div>
      </section>

      {/* ======================= SECTION 3: 远古珍藏 ======================= */}
      <section className="relative w-full bg-[#0a0a0a] text-white flex flex-col z-30">
        {/* 3A 翼龙视频（向上重叠；滚动驱动播放，翼龙从远处飞来停在画面中） */}
        <motion.video
          ref={pteroVideoRef}
          src={PTERO_VIDEO_URL}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onLoadedMetadata={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
          initial={{ x: "-50%", y: "-46%", opacity: 0 }}
          whileInView={{ x: "-50%", y: "-66%", opacity: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute top-0 left-1/2 w-[170vw] md:w-[1200px] max-w-none pointer-events-none z-0"
          aria-label="翼龙骨架飞来影像"
        />

        {/* 3B 标题区 */}
        <div className="relative px-8 md:px-16 pt-32 md:pt-48 mb-16 z-10 flex flex-col xl:flex-row justify-between gap-12">
          <motion.h2
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: easeOutExpo }}
            className="text-[1.8rem] md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem] leading-[1.15] font-medium tracking-tight text-white max-w-[950px]"
          >
            从数百万年的奇迹与发现中典藏而来。
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="shrink-0 xl:text-right xl:pt-6"
          >
            <p className="text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-6 leading-relaxed">
              我们不只是陈列化石
              <br />
              我们分享地球的故事
            </p>
            <div className="flex xl:justify-end gap-3">
              {["教育", "真实", "启迪"].map((t) => (
                <span
                  key={t}
                  className="px-5 py-2 rounded-full border border-gray-600 text-[9px] font-mono tracking-widest uppercase text-gray-300 transition-colors duration-300 hover:bg-white hover:text-black hover:border-white"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 3C 双栏面板 */}
        <div className="relative z-10 h-[1px] bg-gray-800" />
        <div className="relative z-10 flex flex-col md:flex-row">
          {/* 左面板（35%） */}
          <div className="relative w-full md:w-[35%] border-b md:border-b-0 md:border-r border-gray-800 min-h-[400px] md:min-h-[500px] flex flex-col justify-between p-8 overflow-hidden">
            <div className="relative z-10 text-gray-500 text-xl tracking-[0.3em]">***</div>
            <div
              className="absolute inset-0 p-[7%]"
              style={{
                maskImage:
                  "radial-gradient(ellipse at center, #000 42%, transparent 76%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, #000 42%, transparent 76%)",
              }}
            >
              <AnimatePresence mode="wait">
                <SandTransitionImage
                  key={activeChapter}
                  src={chaptersData[activeChapter].image}
                  alt={chaptersData[activeChapter].name}
                  className="w-full h-full object-contain mix-blend-lighten"
                />
              </AnimatePresence>
            </div>
            <div className="relative z-10 flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase">
              <span className="relative inline-block h-[14px] w-[22px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeChapter}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.5, ease: easeOutExpo }}
                    className="absolute inset-0 text-[#888]"
                  >
                    {current}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-[#333]">/</span>
              <span className="text-[#888]">05</span>
            </div>
          </div>

          {/* 右面板（65%） */}
          <div className="w-full md:w-[65%] flex flex-col">
            <div className="border-b border-gray-800 px-8 py-6 flex justify-between items-center text-[10px] font-mono text-gray-400 tracking-widest uppercase">
              <span>探索过去，理解现在。</span>
              <span className="relative inline-flex h-[16px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeChapter}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: easeOutExpo }}
                    className="whitespace-nowrap"
                  >
                    第 {current} 章
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
            {chaptersData.map((ch, i) => {
              const isActive = i === activeChapter;
              return (
                <button
                  key={ch.name}
                  onClick={() => setActiveChapter(i)}
                  className={`cursor-target flex items-center justify-between border-b border-gray-800/80 px-8 py-8 text-left transition-colors duration-500 ${
                    isActive ? "text-white" : "text-[#444] hover:text-[#999]"
                  }`}
                >
                  <span className="text-2xl md:text-[2rem] font-medium tracking-tight">
                    {ch.name}
                  </span>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <ArrowUpRight size={22} strokeWidth={1} className="text-gray-400" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D 底部页脚 */}
        <div className="relative z-10 h-[1px] bg-gray-800" />
        <div className="relative z-10 px-8 py-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase bg-[#0a0a0a]">
          挖掘我们星球的过往
        </div>
      </section>
    </main>
  );
}
