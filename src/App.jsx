import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ArrowLeft, Clapperboard, Star, Sparkles, Shuffle, Heart, Clock } from "lucide-react";

/**
 * 영화 찾기 — TMDB API 연동 버전
 *
 * 실행 전 꼭 해야 할 것:
 * 1. https://www.themoviedb.org 가입 → 설정(Settings) → API → API Key(v3 auth) 발급 (무료)
 * 2. 프로젝트 루트에 .env 파일을 만들고 아래 한 줄 추가:
 *      VITE_TMDB_API_KEY=여기에_발급받은_키_붙여넣기
 * 3. 이 파일을 src/App.jsx 로 저장
 *
 * 한계: TMDB API는 "캐릭터 이름"으로 검색하는 기능을 제공하지 않아요.
 * 그래서 검색은 [영화 제목] 또는 [배우 이름] 두 가지만 지원합니다.
 */

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const IMG_SMALL = "https://image.tmdb.org/t/p/w185";

// 다크 테마 색상 (ink = 배경, paper = 글자)
const TOKENS = {
  ink: "#0B0F19",
  surface: "#151B2B",
  surfaceHover: "#1E2638",
  border: "#2A3347",
  paper: "#F3F4F6",
  muted: "#9AA3B5",
  marquee: "#E11D48",
  marqueeBright: "#F43F5E",
};
const IMG_BACKDROP = "https://image.tmdb.org/t/p/w1280";

// character name -> movie title, curated from the earlier sample dataset
const CHARACTER_TO_TITLE = {
  "기택": "기생충",
  "박동익": "기생충",
  "연교": "기생충",
  "기우": "기생충",
  "기정": "기생충",
  "오대수": "올드보이",
  "이우진": "올드보이",
  "미도": "올드보이",
  "석우": "부산행",
  "성경": "부산행",
  "상화": "부산행",
  "수안": "부산행",
  "쿠퍼": "인터스텔라",
  "브랜드": "인터스텔라",
  "머피": "인터스텔라",
  "세바스찬": "라라랜드",
  "미아": "라라랜드",
  "토니 스타크 / 아이언맨": "어벤져스: 엔드게임",
  "스티브 로저스 / 캡틴 아메리카": "어벤져스: 엔드게임",
  "나타샤 로마노프 / 블랙 위도우": "어벤져스: 엔드게임",
  "해준": "헤어질 결심",
  "서래": "헤어질 결심",
  "제이콥": "미나리",
  "모니카": "미나리",
  "순자": "미나리",
  "마석도": "범죄도시",
  "장첸": "범죄도시",
  "잭": "타이타닉",
  "로즈": "타이타닉",
  "프로도": "반지의 제왕: 반지 원정대",
  "간달프": "반지의 제왕: 반지 원정대",
  "아라곤": "반지의 제왕: 반지 원정대",
  "박두만": "살인의 추억",
  "서태윤": "살인의 추억",
  "히데코": "아가씨",
  "숙희": "아가씨",
  "백작": "아가씨",
  "아서 플렉 / 조커": "조커",
  "강림": "신과함께: 죄와 벌",
  "자홍": "신과함께: 죄와 벌",
  "해원맥": "신과함께: 죄와 벌",
  "고반장": "극한직업",
  "장형사": "극한직업",
  "마형사": "극한직업",
  "이순신": "명량",
  "덕수": "국제시장",
  "영자": "국제시장",
  "서도철": "베테랑",
  "조태오": "베테랑",
  "종구": "곡성",
  "외지인": "곡성",
  "일광": "곡성",
  "효진": "곡성",
  "이자성": "신세계",
  "강과장": "신세계",
  "정청": "신세계",
  "장생": "왕의 남자",
  "공길": "왕의 남자",
  "마카오박": "도둑들",
  "뽀빠이": "도둑들",
  "예니콜": "도둑들",
  "펩시": "도둑들",
  "안옥윤": "암살",
  "염석진": "암살",
  "하와이 피스톨": "암살",
  "만섭": "택시운전사",
  "피터": "택시운전사",
  "승민": "건축학개론",
  "서연": "건축학개론",
  "지영": "82년생 김지영",
  "대현": "82년생 김지영",
  "광해 / 하선": "광해, 왕이 된 남자",
  "허균": "광해, 왕이 된 남자",
  "송우석": "변호인",
  "김신부": "검은 사제들",
  "최부제": "검은 사제들",
  "내경": "관상",
  "수양대군": "관상",
  "만식": "해운대",
  "연희": "해운대",
  "나미": "써니",
  "어린 나미": "써니",
  "전두광": "서울의 봄",
  "이태신": "서울의 봄",
  "상덕": "파묘",
  "화림": "파묘",
  "영근": "파묘",
  "봉길": "파묘",
  "영탁": "콘크리트 유토피아",
  "민성": "콘크리트 유토피아",
  "명화": "콘크리트 유토피아",
  "춘자": "밀수",
  "진숙": "밀수",
  "브루스 웨인 / 배트맨": "다크 나이트",
  "조커": "다크 나이트",
  "하비 덴트": "다크 나이트",
  "포레스트 검프": "포레스트 검프",
  "앤디 듀프레인": "쇼생크 탈출",
  "레드": "쇼생크 탈출",
  "비토 코를레오네": "대부",
  "마이클 코를레오네": "대부",
  "빈센트 베가": "펄프 픽션",
  "줄스 윈필드": "펄프 픽션",
  "미아 월레스": "펄프 픽션",
  "네오": "매트릭스",
  "모피어스": "매트릭스",
  "트리니티": "매트릭스",
  "제이크 설리": "아바타",
  "네이티리": "아바타",
  "엘사 (목소리)": "겨울왕국",
  "안나 (목소리)": "겨울왕국",
  "기쁨 (목소리)": "인사이드 아웃",
  "슬픔 (목소리)": "인사이드 아웃",
  "성인 심바 (목소리)": "라이온 킹",
  "해리 포터": "해리 포터와 마법사의 돌",
  "헤르미온느 그레인저": "해리 포터와 마법사의 돌",
  "론 위즐리": "해리 포터와 마법사의 돌",
  "피터 파커 / 스파이더맨": "스파이더맨: 노 웨이 홈",
  "MJ": "스파이더맨: 노 웨이 홈",
};

const FAV_KEY = "movies:favorites";
const RECENT_KEY = "movies:recents";

async function tmdb(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "ko-KR");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

function Poster({ path, size = 60, ratio = 1.5 }) {
  return path ? (
    <img
      src={`${IMG_SMALL}${path}`}
      alt=""
      style={{ width: size, height: Math.round(size * ratio), objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: Math.round(size * ratio),
        borderRadius: 6,
        background: "#2A2A2A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Star size={14} color="rgba(255,255,255,0.5)" />
    </div>
  );
}

function FavoriteButton({ active, onClick }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="찜하기"
      style={{
        background: active ? "rgba(225,29,72,0.18)" : "rgba(11,15,25,0.7)",
        border: `1px solid ${active ? TOKENS.marquee : "rgba(255,255,255,0.18)"}`,
        borderRadius: 999,
        padding: 7,
        backdropFilter: "blur(4px)",
        cursor: "pointer",
        display: "flex",
        flexShrink: 0,
      }}
    >
      <Heart size={14} color={active ? TOKENS.marquee : TOKENS.muted} fill={active ? TOKENS.marquee : "none"} />
    </button>
  );
}

// 포스터 그리드용 카드 (검색 결과·찜 목록에서 공용)
function PosterCard({ movie, isFavorite, onOpen, onToggleFavorite }) {
  return (
    <div
      className="poster-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      style={{ position: "relative", background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, overflow: "hidden", cursor: "pointer" }}
    >
      <div style={{ aspectRatio: "2 / 3", background: "#1A2030" }}>
        {movie.poster_path ? (
          <img src={`${IMG}${movie.poster_path}`} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clapperboard size={28} color="rgba(255,255,255,0.25)" />
          </div>
        )}
      </div>
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <FavoriteButton active={isFavorite} onClick={onToggleFavorite} />
      </div>
      {movie.vote_average > 0 && (
        <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.65)", color: "#FACC15", fontSize: 11.5, fontWeight: 700, padding: "3px 7px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
          ★ {movie.vote_average.toFixed(1)}
        </div>
      )}
      <div style={{ padding: "10px 10px 12px" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{movie.title}</div>
        <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 4 }}>{(movie.release_date || "").slice(0, 4)}</div>
      </div>
    </div>
  );
}

export default function MovieFinder() {
  const [view, setView] = useState("search"); // search | recommend | favorites
  const [query, setQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [personResults, setPersonResults] = useState([]); // [{person, movies}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null); // movie id being viewed
  const [detail, setDetail] = useState(null); // full movie + credits
  const [history, setHistory] = useState([]); // 이전에 보던 영화 id 스택 (영화→배우→영화 탐색용)
  const [expandedPersonId, setExpandedPersonId] = useState(null);
  const [personDetail, setPersonDetail] = useState(null);
  const [genres, setGenres] = useState([]);
  const [recGenre, setRecGenre] = useState(null); // null = 전체
  const [recMovie, setRecMovie] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
  const [recents, setRecents] = useState(() => JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
  const debounceRef = useRef(null);

  useEffect(() => {
    tmdb("/genre/movie/list").then((d) => setGenres(d.genres || [])).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
  }, [recents]);

  function toggleFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // --- search ---
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setMovieResults([]);
      setPersonResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const [movieRes, personRes] = await Promise.all([
          tmdb("/search/movie", { query }),
          tmdb("/search/person", { query }),
        ]);
        setMovieResults(movieRes.results || []);

        // for the first couple of matched people, pull their notable movies
        const people = (personRes.results || []).slice(0, 3);
        const withMovies = await Promise.all(
          people.map(async (p) => {
            const credits = await tmdb(`/person/${p.id}/movie_credits`);
            const movies = (credits.cast || [])
              .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
              .slice(0, 6);
            return { person: p, movies };
          })
        );
        setPersonResults(withMovies.filter((g) => g.movies.length > 0));
      } catch (e) {
        setError("검색 중 문제가 생겼어요. API 키를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function loadMovie(id) {
    setSelectedId(id);
    setExpandedPersonId(null);
    setPersonDetail(null);
    setRecents((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 10));
    window.scrollTo({ top: 0 });
    try {
      const d = await tmdb(`/movie/${id}`, { append_to_response: "credits" });
      setDetail(d);
    } catch (e) {
      setError("영화 정보를 불러오지 못했어요.");
    }
  }

  // 목록/추천/찜에서 열거나, 상세 화면 안에서 다른 영화로 넘어갈 때
  function openMovie(id) {
    if (selectedId && selectedId !== id) {
      setHistory((prev) => [...prev, selectedId]); // 지금 보던 영화를 기억해 두고 이동
    }
    loadMovie(id);
  }

  // 상세 화면의 "돌아가기": 이전 영화가 있으면 그 영화로, 없으면 목록으로
  function goBack() {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      loadMovie(prevId);
    } else {
      setSelectedId(null);
      setDetail(null);
    }
  }

  async function openPerson(personId) {
    if (expandedPersonId === personId) {
      setExpandedPersonId(null);
      setPersonDetail(null);
      return;
    }
    setExpandedPersonId(personId);
    try {
      const [p, credits] = await Promise.all([
        tmdb(`/person/${personId}`),
        tmdb(`/person/${personId}/movie_credits`),
      ]);
      const movies = (credits.cast || [])
        .filter((m) => m.id !== detail?.id)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 8);
      setPersonDetail({ ...p, movies });
    } catch (e) {
      /* ignore */
    }
  }

  async function pickRecommendation(genreId) {
    try {
      const page = Math.floor(Math.random() * 5) + 1;
      const params = { sort_by: "popularity.desc", page, include_adult: false };
      if (genreId) params.with_genres = genreId;
      const d = await tmdb("/discover/movie", params);
      const pool = d.results || [];
      if (pool.length === 0) return;
      setRecMovie(pool[Math.floor(Math.random() * pool.length)]);
    } catch (e) {
      setError("추천을 가져오지 못했어요.");
    }
  }

  const favoriteList = useMemo(() => favorites, [favorites]);

  if (selectedId && detail) {
    return (
      <MovieDetailView
        movie={detail}
        isFavorite={favorites.includes(detail.id)}
        onToggleFavorite={() => toggleFavorite(detail.id)}
        onBack={goBack}
        backLabel={history.length > 0 ? "이전 영화로" : "돌아가기"}
        expandedPersonId={expandedPersonId}
        personDetail={personDetail}
        onOpenPerson={openPerson}
        onOpenMovie={openMovie}
      />
    );
  }

  const tabs = [
    { id: "search", label: "찾기", icon: Search },
    { id: "recommend", label: "추천", icon: Shuffle },
    { id: "favorites", label: "찜", icon: Heart },
  ];

  return (
    <div style={{ minHeight: "100%", background: TOKENS.ink, color: TOKENS.paper, fontFamily: "'Pretendard', -apple-system, 'Segoe UI', Roboto, sans-serif", padding: "36px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${TOKENS.border}`, paddingBottom: 18, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 22, background: TOKENS.marquee }} />
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>영화 찾기</div>
            </div>
            <div style={{ fontSize: 12.5, color: TOKENS.muted }}>TMDB 실시간 연동 · 포스터/배우 정보 실사용 데이터</div>
          </div>
          <Clapperboard size={22} color={TOKENS.marquee} />
        </div>

        <div style={{ display: "flex", gap: 22, marginBottom: 28, borderBottom: `1px solid ${TOKENS.border}` }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = view === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  color: active ? TOKENS.paper : TOKENS.muted,
                  border: "none",
                  borderBottom: `2px solid ${active ? TOKENS.marquee : "transparent"}`,
                  padding: "0 2px 12px",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                <Icon size={15} color={active ? TOKENS.marquee : TOKENS.muted} fill={t.id === "favorites" && active ? TOKENS.marquee : "none"} />
                {t.label}
                {t.id === "favorites" && favorites.length > 0 && (
                  <span style={{ fontSize: 10.5, background: "rgba(225,29,72,0.12)", color: TOKENS.marquee, borderRadius: 999, padding: "1px 6px" }}>
                    {favorites.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!API_KEY && (
          <div style={{ padding: 16, border: `1px solid ${TOKENS.marquee}`, borderRadius: 8, color: TOKENS.marquee, fontSize: 13.5, marginBottom: 20 }}>
            VITE_TMDB_API_KEY가 설정되지 않았어요. .env 파일에 키를 넣고 개발 서버를 재시작해주세요.
          </div>
        )}

        {view === "search" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.35)" }}>
              <Search size={17} color={TOKENS.marquee} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="영화 제목 또는 배우 이름으로 검색"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TOKENS.paper, fontSize: 14.5 }}
              />
            </div>

            {loading && <div style={{ color: TOKENS.muted, fontSize: 13.5, marginBottom: 16 }}>검색 중...</div>}
            {error && <div style={{ color: TOKENS.marquee, fontSize: 13.5, marginBottom: 16 }}>{error}</div>}

            {personResults.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12, color: TOKENS.marquee, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>배우 검색 결과</div>
                {personResults.map(({ person, movies }) => (
                  <div key={person.id} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>{person.name}</div>
                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                      {movies.map((m) => (
                        <button key={m.id} onClick={() => openMovie(m.id)} style={{ flexShrink: 0, width: 80, background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                          <Poster path={m.poster_path} size={80} />
                          <div style={{ fontSize: 11, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {movieResults.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: TOKENS.marquee, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>영화 검색 결과</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 14 }}>
                  {movieResults.map((m) => (
                    <PosterCard
                      key={m.id}
                      movie={m}
                      isFavorite={favorites.includes(m.id)}
                      onOpen={() => openMovie(m.id)}
                      onToggleFavorite={() => toggleFavorite(m.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {!query.trim() && (
              recents.length > 0 ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TOKENS.marquee, letterSpacing: 1, textTransform: "uppercase" }}>
                      <Clock size={13} />
                      최근 본 영화
                    </div>
                    <button
                      onClick={() => setRecents([])}
                      style={{ background: "transparent", border: "none", color: TOKENS.muted, fontSize: 12, cursor: "pointer", padding: 0 }}
                    >
                      기록 지우기
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 14 }}>
                    {recents.map((id) => (
                      <FavoriteRow key={id} id={id} isFavorite={favorites.includes(id)} onOpen={() => openMovie(id)} onToggle={() => toggleFavorite(id)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: TOKENS.muted, fontSize: 14, padding: "50px 0", border: `1px dashed ${TOKENS.border}`, borderRadius: 10 }}>
                  영화 제목 또는 배우 이름을 입력해보세요.
                </div>
              )
            )}
          </>
        )}

        {view === "recommend" && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 22 }}>
              <button
                onClick={() => setRecGenre(null)}
                style={{ background: recGenre === null ? "rgba(225,29,72,0.18)" : "transparent", color: recGenre === null ? TOKENS.marquee : TOKENS.muted, border: `1px solid ${recGenre === null ? TOKENS.marquee : TOKENS.border}`, borderRadius: 999, padding: "5px 13px", fontSize: 12.5, cursor: "pointer" }}
              >
                전체
              </button>
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setRecGenre(g.id)}
                  style={{ background: recGenre === g.id ? "rgba(225,29,72,0.18)" : "transparent", color: recGenre === g.id ? TOKENS.marquee : TOKENS.muted, border: `1px solid ${recGenre === g.id ? TOKENS.marquee : TOKENS.border}`, borderRadius: 999, padding: "5px 13px", fontSize: 12.5, cursor: "pointer" }}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <button
                onClick={() => pickRecommendation(recGenre)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TOKENS.marquee, color: "#fff", border: "none", borderRadius: 999, padding: "12px 26px", fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}
              >
                <Shuffle size={16} />
                {recMovie ? "다른 영화 추천받기" : "영화 추천"}
              </button>
            </div>
            {recMovie && (
              <button className="row-card" onClick={() => openMovie(recMovie.id)} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 16, padding: 28, cursor: "pointer", color: TOKENS.paper }}>
                <Poster path={recMovie.poster_path} size={140} />
                <div style={{ fontSize: 22, fontWeight: 800, margin: "16px 0 6px" }}>{recMovie.title}</div>
                <div style={{ fontSize: 13, color: TOKENS.muted, marginBottom: 14 }}>{(recMovie.release_date || "").slice(0, 4)}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: TOKENS.paper, maxWidth: 420 }}>{recMovie.overview || "줄거리 정보가 없어요."}</div>
              </button>
            )}
          </div>
        )}

        {view === "favorites" && (
          <div>
            {favoriteList.length === 0 && (
              <div style={{ textAlign: "center", color: TOKENS.muted, fontSize: 14, padding: "50px 0", border: `1px dashed ${TOKENS.border}`, borderRadius: 10 }}>
                아직 찜한 영화가 없어요.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 14 }}>
              {favoriteList.map((id) => (
                <FavoriteRow key={id} id={id} onOpen={() => openMovie(id)} onToggle={() => toggleFavorite(id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// id만 있는 영화를 TMDB에서 불러와 포스터 카드로 보여줌 (찜 목록·최근 본 영화 공용)
function FavoriteRow({ id, onOpen, onToggle, isFavorite = true }) {
  const [m, setM] = useState(null);
  useEffect(() => {
    tmdb(`/movie/${id}`).then(setM).catch(() => {});
  }, [id]);
  if (!m) return null;
  return <PosterCard movie={m} isFavorite={isFavorite} onOpen={onOpen} onToggleFavorite={onToggle} />;
}

function MovieDetailView({ movie, isFavorite, onToggleFavorite, onBack, backLabel = "돌아가기", expandedPersonId, personDetail, onOpenPerson, onOpenMovie }) {
  const cast = (movie.credits?.cast || []).slice(0, 10);
  return (
    <div style={{ minHeight: "100%", background: TOKENS.ink, color: TOKENS.paper, fontFamily: "'Pretendard', -apple-system, 'Segoe UI', Roboto, sans-serif", padding: "36px 20px 60px", position: "relative" }}>
      {/* 영화 배경 이미지를 위쪽에 흐리게 깔기 */}
      {movie.backdrop_path && (
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 420,
            backgroundImage: `linear-gradient(to bottom, rgba(11,15,25,0.35), ${TOKENS.ink}), url(${IMG_BACKDROP}${movie.backdrop_path})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: TOKENS.muted, fontSize: 13.5, cursor: "pointer", padding: 0 }}>
            <ArrowLeft size={15} />
            {backLabel}
          </button>
          <FavoriteButton active={isFavorite} onClick={onToggleFavorite} />
        </div>

        <div style={{ display: "flex", gap: 22, marginBottom: 26, alignItems: "flex-end" }}>
          <div style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.6)", flexShrink: 0 }}>
            <Poster path={movie.poster_path} size={130} ratio={1.5} />
          </div>
          <div>
            <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.3, marginBottom: 8 }}>{movie.title}</div>
            <div style={{ fontSize: 13.5, color: TOKENS.muted }}>
              {(movie.release_date || "").slice(0, 4)} · {(movie.genres || []).map((g) => g.name).join(", ")}
            </div>
            {movie.vote_average > 0 && (
              <div style={{ fontSize: 13, color: TOKENS.marquee, marginTop: 6 }}>★ {movie.vote_average.toFixed(1)} / 10</div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 22, background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TOKENS.marquee, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
            <Sparkles size={13} />
            줄거리
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.75 }}>{movie.overview || "등록된 줄거리가 없어요."}</div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TOKENS.marquee, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
            <Star size={13} />
            출연 · 이름을 누르면 배우 정보와 다른 출연작을 볼 수 있어요
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {cast.map((c) => {
              const expanded = expandedPersonId === c.id;
              return (
                <div key={c.cast_id || c.credit_id}>
                  <button
                    onClick={() => onOpenPerson(c.id)}
                    style={{ width: "100%", display: "flex", gap: 12, alignItems: "center", background: expanded ? "rgba(225,29,72,0.06)" : TOKENS.surface, border: `1px solid ${expanded ? TOKENS.marquee : TOKENS.border}`, borderRadius: expanded ? "8px 8px 0 0" : 8, padding: "10px 14px", cursor: "pointer", textAlign: "left", color: TOKENS.paper }}
                  >
                    <Poster path={c.profile_path} size={36} ratio={1.3} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                      <div style={{ fontSize: 12.5, color: TOKENS.marquee }}>{c.character}</div>
                    </div>
                  </button>
                  {expanded && (
                    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.marquee}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: 14 }}>
                      {!personDetail ? (
                        <div style={{ fontSize: 12.5, color: TOKENS.muted }}>불러오는 중...</div>
                      ) : (
                        <>
                          <div style={{ fontSize: 12, color: TOKENS.muted, marginBottom: 8 }}>
                            {personDetail.place_of_birth ? `출생: ${personDetail.place_of_birth}` : "출생지 정보 없음"}
                            {personDetail.birthday ? ` · ${personDetail.birthday}` : ""}
                          </div>
                          {personDetail.biography && (
                            <div style={{ fontSize: 12.5, lineHeight: 1.6, marginBottom: 12, color: TOKENS.paper }}>
                              {personDetail.biography.slice(0, 220)}
                              {personDetail.biography.length > 220 ? "…" : ""}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: TOKENS.marquee, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
                            다른 출연작 · 누르면 그 영화로 이동
                          </div>
                          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                            {(personDetail.movies || []).map((o) => (
                              <button
                                key={o.id}
                                onClick={() => onOpenMovie(o.id)}
                                title={o.title}
                                style={{ flexShrink: 0, width: 72, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                              >
                                <Poster path={o.poster_path} size={72} />
                                <div style={{ fontSize: 11, marginTop: 4, color: TOKENS.paper, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.title}</div>
                                <div style={{ fontSize: 10.5, color: TOKENS.muted }}>{(o.release_date || "").slice(0, 4)}</div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
