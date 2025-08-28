// imports de funcionalidade
import React, { useEffect, useMemo, useRef, useState } from "react";
// imports de estilização e modelos
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import tailwindcss
import "./global.css";

type Mode = "focus" | "short" | "long";

// Durações de cada modo
const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const LONG_BREAK_EVERY = 4; // a cada 4 pomodoros concluídos, faz pausa longa

export default function Index() {
  // Estados principais
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tempo formatado para string mm:ss
  const timeString = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  // Controla o ticking
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) return prev - 1;
        // terminou o ciclo atual
        handlePhaseEnd();
        return 0; // será redefinido no handlePhaseEnd
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode]);

  // Funções de controle de fim de timer e alteração de modo
  const handlePhaseEnd = () => {
    setIsRunning(false); // pausa ao terminar
    setTimeout(() => {
      if (mode === "focus") {
        setCompletedPomodoros((c) => c + 1);
        // define próxima fase: pausa longa a cada N focos
        const nextMode: Mode =
          (completedPomodoros + 1) % LONG_BREAK_EVERY === 0 ? "long" : "short";
        switchMode(nextMode, false);
      } else {
        // após qualquer pausa, volta ao foco
        switchMode("focus", false);
      }
    }, 0);
  };

  // Troca o modo e reseta o timer
  const switchMode = (nextMode: Mode, keepRunning = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(nextMode);
    setTimeLeft(DURATIONS[nextMode]);
    setIsRunning(keepRunning);
  };

  // Controles de usuário
  const onStart = () => setIsRunning(true);
  const onPause = () => setIsRunning(false);
  const onReset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  // Permite mudar ao usuário modo
  const onManualModeChange = (m: Mode) => {
    switchMode(m, false);
  };

  // Renderização do app
  return (
    // View geral
    <View style={[styles.container, stylesBgByMode[mode]]}>
      <View className="items-center">
        <Text className="tracking-widest" style={styles.title}>
          Pomodoro Timer
        </Text>
        <Text className="text-[0.88rem] text-white">
          Put on some LoFi and focus in your learning
        </Text>
      </View>

      {/* View para container principal */}
      <View className="items-center gap-3 bg-timerBg rounded-2xl px-5 pt-0 pb-4 mt-8 border-2 border-solid border-mainBorder">
        {/* View para modos */}
        <View style={styles.tabs}>
          {(["focus", "short", "long"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => onManualModeChange(m)}
              className={`
                px-4 py-2 
                ${mode === m ? "bg-white/20" : "bg-white/10"}
                ${m === "focus" ? "rounded-tl-sm rounded-bl-sm" : ""}
                ${m === "short" ? "" : ""}
                ${m === "long" ? "rounded-tr-sm rounded-br-sm" : ""}
              `}
            >
              <Text
                className={`${mode === m ? "text-white" : "text-gray-400"}`}
              >
                {m === "focus"
                  ? "Foco"
                  : m === "short"
                  ? "Pausa Curta"
                  : "Pausa Longa"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timer */}
        <Text className="text-[5rem] font-extrabold text-white tracking-widest mt-3">
          {timeString}
        </Text>

        {/* View para botões */}
        <View style={styles.buttons}>
          {isRunning ? (
            <TouchableOpacity
              style={[styles.button, styles.pause]}
              onPress={onPause}
            >
              <Text style={styles.buttonText}>Pausar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.start]}
              onPress={onStart}
            >
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.reset]}
            onPress={onReset}
          >
            <Text style={styles.buttonText}>Resetar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contador de Pomodoros */}
      <Text style={styles.counter}>
        Pomodoros concluídos:{" "}
        <Text style={styles.counterStrong}>{completedPomodoros}</Text>
      </Text>
    </View>
  );
}

const stylesBgByMode = StyleSheet.create({
  focus: { backgroundColor: "#1e1e2e" },
  short: { backgroundColor: "#163b2a" },
  long: { backgroundColor: "#0f2a3a" },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 24,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
  tabs: {
    flexDirection: "row",
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth:0,
    borderColor: "#fff",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  buttons: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  start: { backgroundColor: "#89b4fa" },
  pause: { backgroundColor: "#f9a825" },
  reset: { backgroundColor: "#f38ba8" },
  buttonText: {
    color: "#0b0b0b",
    fontWeight: "800",
    fontSize: 16,
  },
  counter: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 12,
    fontSize: 14,
  },
  counterStrong: {
    color: "#fff",
    fontWeight: "700",
  },
});
