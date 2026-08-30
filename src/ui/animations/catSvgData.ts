export const getSleepingCatSvg = (bgColor: string = 'transparent') => `
<svg id="sleepy-cat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Çalışma masasında uyuyan kedi">
  <title>Masada uyuyan kedi</title>
  <!-- zemin & masa -->
  <rect x="8" y="8" width="184" height="184" rx="28" fill="${bgColor}"></rect>
  <ellipse cx="100" cy="181" rx="66" ry="5" fill="#F1DFC4" opacity="0.6"></ellipse>
  <path d="M38 141V177M162 141V177" stroke="#3A2A1E" stroke-width="4" stroke-linecap="round" fill="none"></path>
  <rect x="22" y="132" width="156" height="9" rx="4.5" fill="#EBD3AC" stroke="#3A2A1E" stroke-width="3"></rect>
  <!-- laptop -->
  <rect x="34" y="125" width="40" height="7" rx="2.5" fill="#FFF7EA" stroke="#3A2A1E" stroke-width="2.5"></rect>
  <path d="M40 125L44 94L76 97L74 125Z" fill="#FFF7EA" stroke="#3A2A1E" stroke-width="2.5" stroke-linejoin="round"></path>
  <path d="M52 104h12M51 110h16M53 98h8" stroke="#3A2A1E" stroke-width="2" stroke-linecap="round" opacity=".65" fill="none"></path>
  <!-- kahve fincanı + buhar -->
  <g fill="none" stroke="#C9A27C" stroke-width="2" stroke-linecap="round">
    <path d="M158 112q3 -4 0 -8">
      <animate attributeName="opacity" values=".85;.15;.85" dur="2.6s" repeatCount="indefinite"></animate>
      <animateTransform attributeName="transform" type="translate" values="0 1.5;0 -2;0 1.5" dur="2.6s" repeatCount="indefinite"></animateTransform>
    </path>
    <path d="M166 112q-3 -4 0 -8">
      <animate attributeName="opacity" values=".15;.85;.15" dur="2.6s" repeatCount="indefinite"></animate>
      <animateTransform attributeName="transform" type="translate" values="0 -2;0 1.5;0 -2" dur="2.6s" repeatCount="indefinite"></animateTransform>
    </path>
  </g>
  <rect x="152" y="118" width="20" height="14" rx="4" fill="#FFF7EA" stroke="#3A2A1E" stroke-width="2.5"></rect>
  <path d="M172 121.5a5 5 0 0 1 0 7" fill="none" stroke="#3A2A1E" stroke-width="2.5"></path>
  <!-- kedi -->
  <g transform="translate(112,132)">
    <!-- yükselen Zzz'ler -->
    <g fill="none" stroke="#E2603F" stroke-linecap="round" stroke-linejoin="round">
      <g opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.6;1" dur="3.4s" begin=".2s" repeatCount="indefinite"></animate>
        <animateTransform attributeName="transform" type="translate" values="-27 -46;-27 -55" dur="3.4s" begin=".2s" repeatCount="indefinite"></animateTransform>
        <path d="M0 0h7l-7 7h7" stroke-width="2.4"></path>
      </g>
      <g opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.6;1" dur="3.4s" begin="1.35s" repeatCount="indefinite"></animate>
        <animateTransform attributeName="transform" type="translate" values="-18 -57;-18 -67" dur="3.4s" begin="1.35s" repeatCount="indefinite"></animateTransform>
        <path d="M0 0h9l-9 9h9" stroke-width="2.6"></path>
      </g>
      <g opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.6;1" dur="3.4s" begin="2.5s" repeatCount="indefinite"></animate>
        <animateTransform attributeName="transform" type="translate" values="-9 -69;-9 -79" dur="3.4s" begin="2.5s" repeatCount="indefinite"></animateTransform>
        <path d="M0 0h11l-11 11h11" stroke-width="2.8"></path>
      </g>
    </g>
    <!-- kuyruk: sarılı, ucu hafifçe kıpırdar -->
    <path d="M25 -7C32 -7 36 -2 32 3C30 5.5 26 5 24 2" fill="none" stroke="#3A2A1E" stroke-width="5" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" values="0 25 -7;9 25 -7;0 25 -7;-6 25 -7;0 25 -7" keyTimes="0;.28;.55;.8;1" dur="4.2s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1"></animateTransform>
    </path>
    <!-- gövde: nefes alma -->
    <g>
      <animateTransform attributeName="transform" type="scale" values="1 1;1.02 1.06;1 1" keyTimes="0;.5;1" dur="3.4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"></animateTransform>
      <path d="M-22 0C-25 -8 -20 -15 -10 -17C0 -19 8 -20 15 -18C23 -16 26 -10 26 -6C26 -2 24 0 19 0C6 -1 -8 -1 -22 0Z" fill="#F19A4D" stroke="#3A2A1E" stroke-width="3" stroke-linejoin="round"></path>
      <!-- katlı ön pati kıvrımı -->
      <path d="M-10 -2q4 -5 9 -1" fill="none" stroke="#3A2A1E" stroke-width="2.2" stroke-linecap="round" opacity=".5"></path>
      <!-- kafa: ara sıra kulak cıvıldaması -->
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 -17 -13;0 -17 -13;8 -17 -13;0 -17 -13" keyTimes="0;.86;.9;.94" dur="5.2s" begin="1.2s" repeatCount="indefinite"></animateTransform>
        <path d="M-27 -19L-31 -30L-21 -24.5Z" fill="#F19A4D" stroke="#3A2A1E" stroke-width="2.6" stroke-linejoin="round"></path>
        <path d="M-11 -24L-6.5 -32L-3 -22.5Z" fill="#F19A4D" stroke="#3A2A1E" stroke-width="2.6" stroke-linejoin="round"></path>
        <circle cx="-17" cy="-13" r="12.5" fill="#F19A4D" stroke="#3A2A1E" stroke-width="3"></circle>
        <path d="M-21 -13Q-18 -10.5 -15 -13" fill="none" stroke="#3A2A1E" stroke-width="2.2" stroke-linecap="round"></path>
        <path d="M-29.5 -10L-31.5 -8.5L-28.5 -7.5Z" fill="#3A2A1E"></path>
        <path d="M-31 -6h-5M-30 -4h-5" stroke="#3A2A1E" stroke-width="1.6" stroke-linecap="round" fill="none"></path>
        <circle cx="-12" cy="-8" r="2.4" fill="#E2603F" opacity=".5"></circle>
      </g>
    </g>
  </g>
</svg>
`;

export const getWalkingCatSvg = (bgColor: string = 'transparent') => `
<svg id="waking-cat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Esneyip doğrulan ve masadan yürüyerek çıkan kedi">
  <title>Esneyen ve yürüyen kedi</title>
  <defs>
    <clipPath id="frame2"><rect x="8" y="8" width="184" height="184" rx="28"></rect></clipPath>
  </defs>
  <rect x="8" y="8" width="184" height="184" rx="28" fill="${bgColor}"></rect>
  <g clip-path="url(#frame2)">
    <ellipse cx="100" cy="183" rx="66" ry="4.5" fill="#F1DFC4" opacity="0.6"></ellipse>
    <path d="M38 149V181M162 149V181" stroke="#3A2A1E" stroke-width="4" stroke-linecap="round" fill="none"></path>
    <rect x="20" y="140" width="160" height="9" rx="4.5" fill="#EBD3AC" stroke="#3A2A1E" stroke-width="3"></rect>
    <!-- laptop -->
    <rect x="142" y="133" width="40" height="7" rx="2.5" fill="#FFF7EA" stroke="#3A2A1E" stroke-width="2.5"></rect>
    <path d="M148 133L152 102L186 105L182 133Z" fill="#FFF7EA" stroke="#3A2A1E" stroke-width="2.5" stroke-linejoin="round"></path>
    <path d="M158 114h10M157 120h16M158 126h15" stroke="#3A2A1E" stroke-width="2" stroke-linecap="round" opacity=".65" fill="none"></path>
    <!-- fincan + buhar -->
    <g fill="none" stroke="#C9A27C" stroke-width="2" stroke-linecap="round">
      <path d="M40 120q3 -4 0 -8">
        <animate attributeName="opacity" values=".85;.15;.85" dur="2.6s" repeatCount="indefinite"></animate>
        <animateTransform attributeName="transform" type="translate" values="0 1.5;0 -2;0 1.5" dur="2.6s" repeatCount="indefinite"></animateTransform>
      </path>
      <path d="M48 120q-3 -4 0 -8">
        <animate attributeName="opacity" values=".15;.85;.15" dur="2.6s" repeatCount="indefinite"></animate>
        <animateTransform attributeName="transform" type="translate" values="0 -2;0 1.5;0 -2" dur="2.6s" repeatCount="indefinite"></animateTransform>
      </path>
    </g>
    <rect x="34" y="126" width="20" height="14" rx="4" fill="#FFF7EA" stroke="#3A2A1E" stroke-width="2.5"></rect>
    <path d="M54 129.5a5 5 0 0 1 0 7" fill="none" stroke="#3A2A1E" stroke-width="2.5"></path>

    <!-- ══ KEDİ · 10 saniyelik senaryo: uyku → uyanma → esneme → oturma → yürüyüş → çıkış ══ -->
    <g transform="translate(112,140)">
      <g>
        <animateTransform attributeName="transform" type="translate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.9;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;.35 0 .5 1" calcMode="spline" values="0 0;0 0;0 0;0 0;0 0;0 0;-170 0;-170 0"></animateTransform>

        <!-- kuyruk: yandan → dik S esneme → yürüyüş kıvrımı -->
        <path fill="none" stroke="#3A2A1E" stroke-width="5.5" stroke-linecap="round" d="M16 -7C25 -7 30 -3 27 2C25 5 21 4 19 1">
          <animate attributeName="d" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="M16 -7C25 -7 30 -3 27 2C25 5 21 4 19 1;
                    M16 -7C25 -7 30 -3 27 2C25 5 21 4 19 1;
                    M17 -10C24 -14 27 -22 20 -28;
                    M16 -24C24 -30 27 -40 19 -46;
                    M16 -24C24 -30 27 -40 19 -46;
                    M18 -28C27 -30 31 -40 24 -45;
                    M18 -12C23 -16 25 -26 18 -31;
                    M18 -12C23 -16 25 -26 18 -31"></animate>
        </path>

        <!-- uzak arka bacak -->
        <g>
          <animateTransform attributeName="transform" type="translate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="23 -9;23 -9;23 -11;25 -17;25 -17;23 -23;23 -11;23 -11"></animateTransform>
          <g>
            <animateTransform attributeName="transform" type="rotate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.575;.61;.645;.68;.715;.75;.785;.82;.855;1" values="0;0;0;0;0;0;22;-22;22;-22;22;-22;22;-22;22;22"></animateTransform>
            <path fill="none" stroke="#C77F3A" stroke-width="5" stroke-linecap="round" d="M0 0Q-4 5 4 9" opacity="0">
              <animate attributeName="d" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="M0 0Q-4 5 4 9;M0 0Q-4 5 4 9;M0 0Q-4 5 4 9;M0 0Q-5 8 -4 16;M0 0Q-5 8 -4 16;M0 0Q-6 12 -2 22;M0 0Q-4 6 2 10;M0 0Q-4 6 2 10"></animate>
              <animate attributeName="opacity" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="0;0;0;1;1;1;1;1"></animate>
            </path>
          </g>
        </g>

        <!-- uzak ön bacak -->
        <g>
          <animateTransform attributeName="transform" type="translate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="-10 -6;-10 -6;-11 -8;-15 -6;-15 -6;-6 -24;-10 -11;-10 -11"></animateTransform>
          <g>
            <animateTransform attributeName="transform" type="rotate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.575;.61;.645;.68;.715;.75;.785;.82;.855;1" values="50;50;30;65;65;-5;-24;24;-24;24;-24;24;-24;24;-24;-24"></animateTransform>
            <path fill="none" stroke="#C77F3A" stroke-width="5" stroke-linecap="round" d="M0 0Q2 4 1 7">
              <animate attributeName="d" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="M0 0Q2 4 1 7;M0 0Q2 4 1 7;M0 0Q2 5 1 9;M0 0Q2 8 1 16;M0 0Q2 8 1 16;M0 0Q2 12 1 22;M0 0Q2 7 1 12;M0 0Q2 7 1 12"></animate>
            </path>
          </g>
        </g>

        <!-- gövde: path morphing ile poz değişimi -->
        <path fill="#F19A4D" stroke="#3A2A1E" stroke-width="3" stroke-linejoin="round" d="M-22 0C-25 -8 -20 -15 -10 -17C0 -19 8 -20 15 -18C23 -16 26 -10 26 -6C26 -2 24 0 19 0C6 -1 -8 -1 -22 0Z">
          <animate attributeName="d" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="M-22 0C-25 -8 -20 -15 -10 -17C0 -19 8 -20 15 -18C23 -16 26 -10 26 -6C26 -2 24 0 19 0C6 -1 -8 -1 -22 0Z;
                    M-22 0C-25 -8 -20 -15 -10 -17C0 -19 8 -20 15 -18C23 -16 26 -10 26 -6C26 -2 24 0 19 0C6 -1 -8 -1 -22 0Z;
                    M-22 0C-25 -8 -20 -15 -10 -17C0 -19 8 -20 15 -18C23 -16 26 -10 26 -6C26 -2 24 0 19 0C6 -1 -8 -1 -22 0Z;
                    M-30 -6C-29 -10 -22 -12 -10 -13C2 -14 12 -26 19 -28C26 -29 29 -22 26 -15C22 -7 8 -3 -6 -2C-16 -1 -26 -2 -30 -6Z;
                    M-30 -6C-29 -10 -22 -12 -10 -13C2 -14 12 -26 19 -28C26 -29 29 -22 26 -15C22 -7 8 -3 -6 -2C-16 -1 -26 -2 -30 -6Z;
                    M-14 0C-16 -10 -12 -22 -5 -29C1 -36 12 -37 18 -31C24 -24 26 -12 24 -4C23 -1 20 0 16 0C6 -1 -4 -1 -14 0Z;
                    M-20 0C-23 -8 -16 -16 -4 -18C8 -20 22 -17 25 -8C26 -4 24 0 20 0C8 -1 -8 -1 -20 0Z;
                    M-20 0C-23 -8 -16 -16 -4 -18C8 -20 22 -17 25 -8C26 -4 24 0 20 0C8 -1 -8 -1 -20 0Z"></animate>
        </path>

        <!-- yakın arka bacak -->
        <g>
          <animateTransform attributeName="transform" type="translate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="18 -8;18 -8;18 -10;20 -16;20 -16;18 -22;18 -10;18 -10"></animateTransform>
          <g>
            <animateTransform attributeName="transform" type="rotate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.575;.61;.645;.68;.715;.75;.785;.82;.855;1" values="0;0;0;0;0;0;-22;22;-22;22;-22;22;-22;22;-22;-22"></animateTransform>
            <path fill="none" stroke="#3A2A1E" stroke-width="5" stroke-linecap="round" d="M0 0Q4 5 -4 9" opacity="0">
              <animate attributeName="d" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="M0 0Q4 5 -4 9;M0 0Q4 5 -4 9;M0 0Q4 5 -4 9;M0 0Q5 8 5 16;M0 0Q5 8 5 16;M0 0Q6 12 2 22;M0 0Q4 6 -2 10;M0 0Q4 6 -2 10"></animate>
              <animate attributeName="opacity" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="0;0;0;1;1;1;1;1"></animate>
            </path>
          </g>
        </g>

        <!-- kafa: konum + açı ile pozlar; yürürken hafif sallanır -->
        <g>
          <animateTransform attributeName="transform" type="translate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="-26 -9;-26 -9;-20 -14;-33 -8;-33 -8;0 -43;-16 -24;-16 -24"></animateTransform>
          <g>
            <animateTransform attributeName="transform" type="rotate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.575;.61;.645;.68;.715;.75;.785;.82;.855;1" values="-24 0 0;-24 0 0;-6 0 0;22 0 0;22 0 0;0 0 0;4 0 0;-4 0 0;4 0 0;-4 0 0;4 0 0;-4 0 0;4 0 0;-4 0 0;4 0 0;4 0 0"></animateTransform>
            <path d="M-8 -7L-13 -17L-3 -11Z" fill="#F19A4D" stroke="#3A2A1E" stroke-width="2.6" stroke-linejoin="round"></path>
            <path d="M2 -11L7 -18L9 -7Z" fill="#F19A4D" stroke="#3A2A1E" stroke-width="2.6" stroke-linejoin="round"></path>
            <circle r="11" fill="#F19A4D" stroke="#3A2A1E" stroke-width="3"></circle>
            <!-- kapalı göz: uykuda + esneme anında -->
            <path d="M-7 -2Q-3.5 .8 0 -2" fill="none" stroke="#3A2A1E" stroke-width="2.2" stroke-linecap="round" opacity="1">
              <animate attributeName="opacity" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="1;1;0;1;1;0;0;0"></animate>
            </path>
            <!-- açık göz -->
            <circle cx="-3.5" cy="-2" r="1.8" fill="#3A2A1E" opacity="0">
              <animate attributeName="opacity" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="0;0;1;0;0;1;1;1"></animate>
            </circle>
            <!-- esneme ağzı -->
            <path d="M-6.5 5Q-2.5 9.5 1.5 5.5" fill="none" stroke="#3A2A1E" stroke-width="2.2" stroke-linecap="round" opacity="0">
              <animate attributeName="opacity" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="0;0;0;1;1;0;0;0"></animate>
            </path>
            <path d="M-10.8 1.5L-13.3 3.3L-10.3 4.4Z" fill="#3A2A1E"></path>
            <path d="M-13 4h-5.5M-12 6.5h-5.5" stroke="#3A2A1E" stroke-width="1.6" stroke-linecap="round" fill="none"></path>
            <circle cx="1.5" cy="3.5" r="2.3" fill="#E2603F" opacity=".5"></circle>
          </g>
        </g>

        <!-- yakın ön bacak -->
        <g>
          <animateTransform attributeName="transform" type="translate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="-14 -5;-14 -5;-15 -7;-20 -3;-20 -3;-11 -25;-15 -12;-15 -12"></animateTransform>
          <g>
            <animateTransform attributeName="transform" type="rotate" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.575;.61;.645;.68;.715;.75;.785;.82;.855;1" values="55;55;35;80;80;0;24;-24;24;-24;24;-24;24;-24;24;24"></animateTransform>
            <path fill="none" stroke="#3A2A1E" stroke-width="5" stroke-linecap="round" d="M0 0Q-2 4 -1 7">
              <animate attributeName="d" dur="10s" repeatCount="indefinite" keyTimes="0;.25;.3;.38;.46;.54;.6;1" values="M0 0Q-2 4 -1 7;M0 0Q-2 4 -1 7;M0 0Q-2 5 -1 9;M0 0Q-3 8 -2 16;M0 0Q-3 8 -2 16;M0 0Q-3 12 -1 23;M0 0Q-2 7 -1 12;M0 0Q-2 7 -1 12"></animate>
            </path>
          </g>
        </g>

        <!-- uykudaki Zzz'ler: uyanınca kaybolur -->
        <g fill="none" stroke="#E2603F" stroke-linecap="round" stroke-linejoin="round" opacity="1">
          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.26;.3;1" dur="10s" repeatCount="indefinite"></animate>
          <g opacity="0">
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.65;1" dur="2.4s" begin="0s" repeatCount="indefinite"></animate>
            <animateTransform attributeName="transform" type="translate" values="-33 -42;-33 -52" dur="2.4s" begin="0s" repeatCount="indefinite"></animateTransform>
            <path d="M0 0h7l-7 7h7" stroke-width="2.4"></path>
          </g>
          <g opacity="0">
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.65;1" dur="2.4s" begin="1.2s" repeatCount="indefinite"></animate>
            <animateTransform attributeName="transform" type="translate" values="-24 -51;-24 -61" dur="2.4s" begin="1.2s" repeatCount="indefinite"></animateTransform>
            <path d="M0 0h9l-9 9h9" stroke-width="2.6"></path>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>
`;
