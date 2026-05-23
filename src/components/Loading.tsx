import { useGradiente } from "../hooks/useGradiente";

function Loading() {
  const cor_fundo = useGradiente();
  return (
    <div
      className={`min-h-screen w-full ${cor_fundo} flex flex-col items-center justify-center gap-6`}
    >
      {/* Arcos giratórios + ícone central */}
      <div className="relative w-20 h-20">
        {/* Trilha externa */}
        <svg
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "2s" }}
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="white"
            strokeOpacity="0.08"
            strokeWidth="3"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeDasharray="56 170"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
        </svg>

        {/* Trilha interna (gira ao contrário) */}
        <svg
          className="absolute"
          style={{
            inset: "8px",
            width: "calc(100% - 16px)",
            height: "calc(100% - 16px)",
            animation: "spin-reverse 1.4s linear infinite",
          }}
          viewBox="0 0 64 64"
          fill="none"
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="2.5"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="30 146"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
        </svg>

        {/* Ícone de calendário centralizado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center border border-white/15 bg-white/[0.06]">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect
                x="2"
                y="4"
                width="24"
                height="22"
                rx="3"
                stroke="white"
                strokeWidth="1.8"
              />
              <line
                x1="2"
                y1="10"
                x2="26"
                y2="10"
                stroke="white"
                strokeWidth="1.8"
                strokeOpacity="0.6"
              />
              <line
                x1="8"
                y1="2"
                x2="8"
                y2="7"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="20"
                y1="2"
                x2="20"
                y2="7"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect
                x="7"
                y="14"
                width="4"
                height="3"
                rx="1"
                fill="white"
                fillOpacity="0.9"
              />
              <rect
                x="12"
                y="14"
                width="4"
                height="3"
                rx="1"
                fill="white"
                fillOpacity="0.5"
              />
              <rect
                x="17"
                y="14"
                width="4"
                height="3"
                rx="1"
                fill="white"
                fillOpacity="0.25"
              />
              <rect
                x="7"
                y="19"
                width="4"
                height="3"
                rx="1"
                fill="white"
                fillOpacity="0.25"
              />
              <rect
                x="12"
                y="19"
                width="4"
                height="3"
                rx="1"
                fill="white"
                fillOpacity="0.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Texto */}
      <p className="text-sm text-white/50 tracking-wide">Carregando ...</p>

      {/* Barra de progresso */}
      <div className="w-44 h-[2px] rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-white"
          style={{ animation: "progress-loop 2.2s ease-in-out infinite" }}
        />
      </div>

      {/* Keyframes injetados via <style> */}
      <style>{`
        @keyframes spin-reverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes progress-loop {
          0%   { width: 0%;   margin-left: 0;    }
          40%  { width: 60%;  margin-left: 0;    }
          60%  { width: 60%;  margin-left: 40%;  }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

export default Loading;
