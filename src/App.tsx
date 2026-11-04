/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { GameLevelId, PlayerStats, ChallengeProblem, IslandZoneId, InteractableEntity } from './types/game';
import { CHALLENGES, GAME_BADGES, ISLAND_ZONES, GRAPH_PROBLEMS } from './data/challenges';
import { TreasureIsland3DScene } from './components/TreasureIsland3DScene';
import { Header } from './components/Header';
import { IslandMinimap } from './components/IslandMinimap';
import { ScratchpadModal } from './components/ScratchpadModal';
import { Mission1ForestModal } from './components/Mission1ForestModal';
import { Mission2GemsModal } from './components/Mission2GemsModal';
import { Mission3SuppliesModal } from './components/Mission3SuppliesModal';
import { Mission4GraphModal } from './components/Mission4GraphModal';
import { Mission5FinalModal } from './components/Mission5FinalModal';
import { EvaluationModal } from './components/EvaluationModal';
import { CertificateModal } from './components/CertificateModal';
import { BadgeDrawer } from './components/BadgeDrawer';
import { GuideModal } from './components/GuideModal';
import { sound } from './utils/audio';
import {
  Compass,
  MapPin,
  Sparkles,
  Award,
  BookOpen,
  HelpCircle,
  PenTool,
  Coins,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  X,
  Volume2,
} from 'lucide-react';

const INITIAL_STATS: PlayerStats = {
  score: 0,
  coins: 0,
  level: 1,
  xp: 0,
  starsByLevel: {},
  completedLevels: [],
  badges: ['first_explorer'],
  totalCorrect: 0,
  totalAttempts: 0,
  hintsUsedCount: 0,
  eliminationMasteryScore: 0,
  substitutionMasteryScore: 0,
  modelingMasteryScore: 0,
  contextualMasteryScore: 0,
  graphMasteryScore: 0,
  playerName: 'Penjelajah SMA',
  sealsUnlocked: [],
  openedChests: [],
  collectedCoinIds: [],
  timeElapsedSeconds: 0,
  currentZone: 'beach',
};

export default function App() {
  const [levelId, setLevelId] = useState<GameLevelId>(1);
  const [subIndex, setSubIndex] = useState<number>(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Player live position from 3D scene
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 38, angle: Math.PI, zone: 'beach' as IslandZoneId });
  const [teleportTargetZone, setTeleportTargetZone] = useState<IslandZoneId | null>(null);

  // Active Modals
  const [isMissionOpen, setIsMissionOpen] = useState<boolean>(false);
  const [activeNpcDialogue, setActiveNpcDialogue] = useState<{ name: string; lines: string[]; lineIndex: number } | null>(null);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isFullMapOpen, setIsFullMapOpen] = useState<boolean>(false);

  // Notification Toast for collected coins / achievements
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Player Stats with LocalStorage persistence
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem('treasure_island_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STATS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('treasure_island_stats', JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Timer loop for time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        timeElapsedSeconds: prev.timeElapsedSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter challenges for current mission
  const levelChallenges = useMemo(() => {
    return CHALLENGES.filter((c) => c.levelId === levelId);
  }, [levelId]);

  const currentChallenge = useMemo(() => {
    return (
      levelChallenges.find((c) => c.subLevelIndex === subIndex) ||
      levelChallenges[0] ||
      CHALLENGES[0]
    );
  }, [levelChallenges, subIndex]);

  // Current zone data
  const currentZoneData = useMemo(() => {
    return ISLAND_ZONES.find((z) => z.id === playerPos.zone) || ISLAND_ZONES[0];
  }, [playerPos.zone]);

  // Toggle Sound
  const handleToggleSound = () => {
    sound.enabled = !isSoundEnabled;
    setIsSoundEnabled(!isSoundEnabled);
    if (!isSoundEnabled) sound.playClick();
  };

  // Show quick notification toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Handle Coin Collection in 3D world
  const handleCollectCoin = (coinId: string) => {
    sound.playCollectCoin();
    setStats((prev) => {
      const newCollected = [...prev.collectedCoinIds, coinId];
      const newCoins = prev.coins + 10;
      const newScore = prev.score + 25;
      const newBadges = [...prev.badges];

      if (newCollected.length >= 15 && !newBadges.includes('coin_hunter')) {
        newBadges.push('coin_hunter');
        triggerToast('🏆 Lencana Baru Diraih: Pemburu Koin Emas!');
      }

      return {
        ...prev,
        coins: newCoins,
        score: newScore,
        collectedCoinIds: newCollected,
      };
    });
    triggerToast('+10 Koin Emas Ditemukan!');
  };

  // Handle Proximity Interaction from 3D Scene
  const handleInteractWithEntity = (entity: InteractableEntity) => {
    sound.playClick();

    if (entity.type === 'npc' && entity.dialogue) {
      setActiveNpcDialogue({
        name: entity.name,
        lines: entity.dialogue,
        lineIndex: 0,
      });
      return;
    }

    if (entity.missionLevel) {
      setLevelId(entity.missionLevel as GameLevelId);
      setSubIndex(1);
      setIsMissionOpen(true);
    }
  };

  // Advance NPC dialogue line
  const handleNextDialogue = () => {
    if (!activeNpcDialogue) return;
    sound.playClick();
    if (activeNpcDialogue.lineIndex < activeNpcDialogue.lines.length - 1) {
      setActiveNpcDialogue({
        ...activeNpcDialogue,
        lineIndex: activeNpcDialogue.lineIndex + 1,
      });
    } else {
      setActiveNpcDialogue(null);
    }
  };

  // Handle successful problem solve
  const handleSolveSuccess = (missionLvl: number, sub: number, isLastSub: boolean) => {
    setStats((prev) => {
      const newSeals = [...prev.sealsUnlocked];
      if (isLastSub && !newSeals.includes(missionLvl)) {
        newSeals.push(missionLvl);
        sound.playSealUnlock();
      }

      const newBadges = [...prev.badges];
      if (missionLvl === 1 && !newBadges.includes('forest_number')) newBadges.push('forest_number');
      if (missionLvl === 2 && !newBadges.includes('gem_master')) newBadges.push('gem_master');
      if (missionLvl === 3 && !newBadges.includes('merchant_hero')) newBadges.push('merchant_hero');
      if (missionLvl === 4 && !newBadges.includes('cartesian_sage')) newBadges.push('cartesian_sage');
      if (missionLvl === 5 && !newBadges.includes('ultimate_treasure_king')) newBadges.push('ultimate_treasure_king');

      const completed = prev.completedLevels.includes(missionLvl)
        ? prev.completedLevels
        : [...prev.completedLevels, missionLvl];

      return {
        ...prev,
        score: prev.score + 150,
        coins: prev.coins + 50,
        totalCorrect: prev.totalCorrect + 1,
        totalAttempts: prev.totalAttempts + 1,
        completedLevels: completed,
        sealsUnlocked: newSeals,
        badges: newBadges,
        modelingMasteryScore: prev.modelingMasteryScore + 1,
        eliminationMasteryScore: missionLvl === 3 ? prev.eliminationMasteryScore + 1 : prev.eliminationMasteryScore,
        substitutionMasteryScore: missionLvl === 2 || missionLvl === 5 ? prev.substitutionMasteryScore + 1 : prev.substitutionMasteryScore,
        graphMasteryScore: missionLvl === 4 ? prev.graphMasteryScore + 1 : prev.graphMasteryScore,
        contextualMasteryScore: prev.contextualMasteryScore + 1,
      };
    });

    if (isLastSub) {
      triggerToast(`🎉 Segel Rahasia #${missionLvl} Berhasil Dibuka!`);
    } else {
      triggerToast('Jawaban Benar! +150 XP & +50 Koin Emas');
    }
  };

  // Open specific mission modal from header
  const handleSelectLevel = (newLevelId: GameLevelId) => {
    setLevelId(newLevelId);
    setSubIndex(1);
    setIsMissionOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* Top Navigation Header */}
      <Header
        currentLevelId={levelId}
        onSelectLevel={handleSelectLevel}
        stats={stats}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenEvaluation={() => setIsEvaluationOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenScratchpad={() => setIsScratchpadOpen(true)}
        onOpenMap={() => setIsFullMapOpen(true)}
      />

      {/* Main 3D Viewport Stage */}
      <main className="flex-1 relative w-full h-[calc(100vh-62px)] overflow-hidden">
        {/* 3D Roblox-Style Island Canvas */}
        <TreasureIsland3DScene
          onInteract={handleInteractWithEntity}
          onCollectCoin={handleCollectCoin}
          collectedCoinIds={stats.collectedCoinIds}
          sealsUnlocked={stats.sealsUnlocked}
          onPlayerPosChange={(pos) => setPlayerPos(pos)}
          teleportTargetZone={teleportTargetZone}
          onClearTeleportTarget={() => setTeleportTargetZone(null)}
        />

        {/* Top-Right HUD: Minimap & Compass */}
        <div className="absolute top-4 right-4 z-20">
          <IslandMinimap
            playerPos={playerPos}
            currentZone={playerPos.zone}
            sealsUnlocked={stats.sealsUnlocked}
            onTeleportToZone={(zid) => setTeleportTargetZone(zid)}
          />
        </div>

        {/* Quick Action Floating Bar (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsMissionOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-xl shadow-amber-500/20 border border-white transition active:scale-95 text-xs"
          >
            <span>📜</span>
            <span>Misi {levelId}: Buka Teka-Teki</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsScratchpadOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-teal-300 font-bold border border-teal-500/30 text-xs shadow-md transition"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Papan Coret</span>
          </button>
        </div>

        {/* Notification Toast Message */}
        {toastMessage && (
          <div className="absolute top-18 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900/95 border border-amber-400 text-amber-300 font-mono font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-150">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* NPC Dialogue Box Overlay */}
        {activeNpcDialogue && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-150">
            <div className="bg-slate-900/95 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  {activeNpcDialogue.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeNpcDialogue.lineIndex + 1}/{activeNpcDialogue.lines.length}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed min-h-[48px]">
                "{activeNpcDialogue.lines[activeNpcDialogue.lineIndex]}"
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextDialogue}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                >
                  <span>
                    {activeNpcDialogue.lineIndex < activeNpcDialogue.lines.length - 1
                      ? 'Lanjut'
                      : 'Mengerti, Terima Kasih!'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mission Interactive Modals */}
      {isMissionOpen && levelId === 1 && (
        <Mission1ForestModal
          isOpen={isMissionOpen}
          onClose={() => setIsMissionOpen(false)}
          challenge={currentChallenge}
          allChallenges={levelChallenges}
          currentSubIndex={subIndex}
          onSelectSubIndex={setSubIndex}
          onSolveSuccess={handleSolveSuccess}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
        />
      )}

      {isMissionOpen && levelId === 2 && (
        <Mission2GemsModal
          isOpen={isMissionOpen}
          onClose={() => setIsMissionOpen(false)}
          challenge={currentChallenge}
          allChallenges={levelChallenges}
          currentSubIndex={subIndex}
          onSelectSubIndex={setSubIndex}
          onSolveSuccess={handleSolveSuccess}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
        />
      )}

      {isMissionOpen && levelId === 3 && (
        <Mission3SuppliesModal
          isOpen={isMissionOpen}
          onClose={() => setIsMissionOpen(false)}
          challenge={currentChallenge}
          allChallenges={levelChallenges}
          currentSubIndex={subIndex}
          onSelectSubIndex={setSubIndex}
          onSolveSuccess={handleSolveSuccess}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
        />
      )}

      {isMissionOpen && levelId === 4 && (
        <Mission4GraphModal
          isOpen={isMissionOpen}
          onClose={() => setIsMissionOpen(false)}
          allProblems={GRAPH_PROBLEMS}
          currentSubIndex={subIndex}
          onSelectSubIndex={setSubIndex}
          onSolveSuccess={handleSolveSuccess}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
        />
      )}

      {isMissionOpen && levelId === 5 && (
        <Mission5FinalModal
          isOpen={isMissionOpen}
          onClose={() => setIsMissionOpen(false)}
          challenge={currentChallenge}
          allChallenges={levelChallenges}
          currentSubIndex={subIndex}
          onSelectSubIndex={setSubIndex}
          sealsUnlocked={stats.sealsUnlocked}
          onSolveSuccess={handleSolveSuccess}
          onOpenEvaluation={() => {
            setIsMissionOpen(false);
            setIsEvaluationOpen(true);
          }}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
        />
      )}

      {/* Auxiliary Modals */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      <EvaluationModal
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
        stats={stats}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        stats={stats}
        onUpdateName={(name) => setStats((prev) => ({ ...prev, playerName: name }))}
      />

      <BadgeDrawer
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        unlockedBadgeIds={stats.badges}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
