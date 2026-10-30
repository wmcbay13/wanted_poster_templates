/*
 * Built-in "suspect" portraits used in place of a guest photo.
 * Each is a 240x300 SVG mugshot-style illustration with its own backdrop.
 * The photo slot applies the color-mode filter (sepia / grayscale) on top.
 */
(function (global) {
  'use strict';

  const W = 240, H = 300;
  const ink = '#2b1a10';
  let n = 0;
  const bg = (c1, c2, id = `pbg-${++n}`) => `
    <defs><radialGradient id="${id}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id})"/>
    <g stroke="${ink}" stroke-opacity=".12" stroke-width="2">${[60, 110, 160, 210, 260].map((y) => `<path d="M0 ${y} H240"/>`).join('')}</g>`;
  const shoulders = (fill) => `<path d="M10 300 C14 238 58 220 120 220 C182 220 226 238 230 300 Z" fill="${fill}" stroke="${ink}" stroke-width="3"/>`;
  const wrap = (body) => `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${body}</svg>`;

  const P = {
    silhouette: {
      label: 'Mystery Silhouette',
      svg: () => wrap(`${bg('#d9c7a0', '#a88f62')}
        <path d="M120 54 C162 54 180 84 178 122 C176 160 156 192 120 192 C84 192 64 160 62 122 C60 84 78 54 120 54 Z" fill="#2a221c"/>
        <path d="M100 186 L100 214 L140 214 L140 186 Z" fill="#2a221c"/>
        ${shoulders('#2a221c')}
        <text x="120" y="150" text-anchor="middle" font-family="Rye, serif" font-size="82" fill="#d9c7a0" opacity=".85">?</text>`),
    },
    pumpkin: {
      label: 'Pumpkin Head',
      svg: () => wrap(`${bg('#efd9a8', '#b98d4f')}
        ${shoulders('#3b2b4a')}
        <path d="M86 214 L120 248 L154 214 Z" fill="#e8dcc0" stroke="${ink}" stroke-width="3"/>
        <path d="M112 50 C110 34 118 24 132 22 L134 30 C126 32 124 40 126 52 Z" fill="#5b6b2e" stroke="${ink}" stroke-width="3"/>
        <path d="M120 50 C84 40 40 62 40 124 C40 186 84 208 120 202 C156 208 200 186 200 124 C200 62 156 40 120 50 Z" fill="#e0701f" stroke="${ink}" stroke-width="4"/>
        <path d="M120 50 C96 54 86 90 86 126 C86 166 100 198 120 202 M120 50 C144 54 154 90 154 126 C154 166 140 198 120 202" fill="none" stroke="#a84a14" stroke-width="3"/>
        <path d="M72 116 L102 116 L87 90 Z M138 116 L168 116 L153 90 Z" fill="#ffd25e" stroke="${ink}" stroke-width="3"/>
        <path d="M66 142 Q120 196 174 142 L160 150 L152 162 L140 154 L120 172 L100 154 L88 162 L80 150 Z" fill="#ffd25e" stroke="${ink}" stroke-width="3"/>`),
    },
    ghost: {
      label: 'Friendly Ghost',
      svg: () => wrap(`${bg('#c9c9b6', '#7f8a86')}
        <path d="M54 300 L58 132 C58 58 182 58 182 132 L186 300 Z" fill="#f4efe2" stroke="${ink}" stroke-width="4"/>
        <path d="M58 168 C30 172 22 196 18 216 C34 204 46 204 58 206 M182 168 C210 172 218 196 222 216 C206 204 194 204 182 206" fill="#f4efe2" stroke="${ink}" stroke-width="4"/>
        <ellipse cx="96" cy="128" rx="13" ry="20" fill="${ink}"/><ellipse cx="144" cy="128" rx="13" ry="20" fill="${ink}"/>
        <circle cx="100" cy="120" r="4" fill="#fff"/><circle cx="148" cy="120" r="4" fill="#fff"/>
        <ellipse cx="120" cy="174" rx="14" ry="18" fill="${ink}"/>
        <ellipse cx="76" cy="160" rx="12" ry="6" fill="#e8a0a0" opacity=".6"/><ellipse cx="164" cy="160" rx="12" ry="6" fill="#e8a0a0" opacity=".6"/>`),
    },
    vampire: {
      label: 'Vampire',
      svg: () => wrap(`${bg('#c7a98a', '#6e3b2f')}
        <path d="M10 300 L20 200 L60 170 L120 236 L180 170 L220 200 L230 300 Z" fill="#7a1418" stroke="${ink}" stroke-width="3"/>
        <path d="M40 300 C44 240 74 226 120 226 C166 226 196 240 200 300 Z" fill="#1d1a1a" stroke="${ink}" stroke-width="3"/>
        <path d="M100 226 L120 270 L140 226 Z" fill="#f0e8d8" stroke="${ink}" stroke-width="2.5"/>
        <path d="M110 230 L120 240 L130 230 L120 222 Z" fill="#7a1418" stroke="${ink}" stroke-width="2"/>
        <path d="M120 60 C160 60 176 92 174 128 C172 172 150 204 120 204 C90 204 68 172 66 128 C64 92 80 60 120 60 Z" fill="#e9e2d0" stroke="${ink}" stroke-width="4"/>
        <path d="M66 112 C60 66 92 46 120 54 C148 46 180 66 174 112 C166 94 150 84 132 82 L120 100 L108 82 C90 84 74 94 66 112 Z" fill="#1d1a1a"/>
        <path d="M84 128 Q98 118 110 128 M130 128 Q142 118 156 128" stroke="${ink}" stroke-width="4" fill="none"/>
        <circle cx="97" cy="134" r="5" fill="#8a0303"/><circle cx="143" cy="134" r="5" fill="#8a0303"/>
        <path d="M100 172 Q120 182 140 172" stroke="${ink}" stroke-width="3.5" fill="none"/>
        <path d="M106 174 L109 186 L112 176 Z M128 176 L131 186 L134 174 Z" fill="#fff" stroke="${ink}" stroke-width="1.5"/>
        <path d="M132 188 Q133 196 131 198" stroke="#8a0303" stroke-width="3" fill="none"/>`),
    },
    witch: {
      label: 'Witch',
      svg: () => wrap(`${bg('#c9c39a', '#5e6b3a')}
        ${shoulders('#2c2238')}
        <path d="M76 206 C70 230 64 260 52 300 L72 300 C84 260 92 232 96 210 Z M164 206 C170 230 176 260 188 300 L168 300 C156 260 148 232 144 210 Z" fill="#c4561d" stroke="${ink}" stroke-width="3"/>
        <path d="M120 86 C156 86 170 112 168 144 C166 180 148 210 120 210 C92 210 74 180 72 144 C70 112 84 86 120 86 Z" fill="#9fbf6b" stroke="${ink}" stroke-width="4"/>
        <path d="M118 140 C130 156 132 168 122 172" stroke="${ink}" stroke-width="3.5" fill="none"/>
        <circle cx="136" cy="168" r="3" fill="${ink}"/>
        <ellipse cx="100" cy="138" rx="7" ry="9" fill="#fff" stroke="${ink}" stroke-width="2.5"/><circle cx="102" cy="140" r="4" fill="${ink}"/>
        <ellipse cx="142" cy="138" rx="7" ry="9" fill="#fff" stroke="${ink}" stroke-width="2.5"/><circle cx="144" cy="140" r="4" fill="${ink}"/>
        <path d="M100 186 Q120 198 142 184" stroke="${ink}" stroke-width="3.5" fill="none"/>
        <path d="M30 108 C70 96 170 96 210 108 C190 118 50 118 30 108 Z" fill="#2c2238" stroke="${ink}" stroke-width="3"/>
        <path d="M74 104 C84 70 98 36 150 10 C140 30 152 56 166 104 Z" fill="#2c2238" stroke="${ink}" stroke-width="3"/>
        <path d="M80 92 L162 92 L164 102 L78 102 Z" fill="#7b4a8f" stroke="${ink}" stroke-width="2.5"/>
        <rect x="110" y="88" width="18" height="18" fill="#d9a521" stroke="${ink}" stroke-width="2.5"/>`),
    },
    skeleton: {
      label: 'Skeleton',
      svg: () => wrap(`${bg('#8f8a7a', '#3a3530')}
        <path d="M20 300 C24 246 66 232 120 232 C174 232 216 246 220 300 Z" fill="#1d1a1a"/>
        <g stroke="#efe3c8" stroke-width="7" stroke-linecap="round" fill="none"><path d="M120 214 L120 300"/><path d="M84 248 Q120 238 156 248 M80 266 Q120 256 160 266 M78 284 Q120 274 162 284"/></g>
        <path d="M120 44 C76 44 58 78 62 114 C64 134 74 144 86 148 L86 176 C86 184 92 190 100 190 L140 190 C148 190 154 184 154 176 L154 148 C166 144 176 134 178 114 C182 78 164 44 120 44 Z" fill="#efe3c8" stroke="${ink}" stroke-width="4"/>
        <ellipse cx="96" cy="112" rx="17" ry="19" fill="${ink}"/><ellipse cx="144" cy="112" rx="17" ry="19" fill="${ink}"/>
        <path d="M120 130 L110 152 L130 152 Z" fill="${ink}"/>
        <path d="M94 168 L146 168 M104 164 L104 190 M120 164 L120 190 M136 164 L136 190" stroke="${ink}" stroke-width="3.5"/>`),
    },
    mummy: {
      label: 'Mummy',
      svg: () => wrap(`${bg('#d8c08e', '#8a6a3b')}
        ${shoulders('#e2d6b8')}
        <g stroke="#9c8a66" stroke-width="3" fill="none"><path d="M24 260 L216 244 M16 284 L224 270 M40 240 L200 236"/></g>
        <path d="M120 54 C162 54 178 86 176 124 C174 168 152 206 120 206 C88 206 66 168 64 124 C62 86 78 54 120 54 Z" fill="#e8dcc0" stroke="${ink}" stroke-width="4"/>
        <g stroke="#9c8a66" stroke-width="3" fill="none">
          <path d="M66 96 L176 84 M64 132 L174 116 M70 160 L172 150 M80 184 L162 176 M74 74 L160 64"/>
          <path d="M68 112 L176 126 M72 148 L170 168 M90 196 L152 190"/></g>
        <path d="M74 112 L168 104 L168 128 L74 136 Z" fill="#1d1a1a"/>
        <circle cx="100" cy="121" r="8" fill="#e8dcc0"/><circle cx="102" cy="122" r="4" fill="#c4561d"/>
        <circle cx="142" cy="118" r="6" fill="#e8dcc0"/><circle cx="143" cy="119" r="3" fill="#c4561d"/>
        <path d="M144 196 C150 220 140 240 150 262" stroke="#e8dcc0" stroke-width="9" fill="none" stroke-linecap="round"/>`),
    },
    monster: {
      label: 'Monster',
      svg: () => wrap(`${bg('#c8c49a', '#55603a')}
        ${shoulders('#2a2a2a')}
        <path d="M58 218 L80 300 M182 218 L160 300" stroke="#55555a" stroke-width="5"/>
        <rect x="58" y="70" width="124" height="142" rx="18" fill="#8fb06a" stroke="${ink}" stroke-width="4"/>
        <path d="M56 98 C56 58 74 46 120 46 C166 46 184 58 184 98 L172 90 L162 100 L150 88 L138 100 L124 88 L112 100 L100 88 L88 100 L76 90 L66 100 Z" fill="#1d1a1a"/>
        <rect x="40" y="160" width="20" height="14" rx="3" fill="#8a8a92" stroke="${ink}" stroke-width="3"/><rect x="180" y="160" width="20" height="14" rx="3" fill="#8a8a92" stroke="${ink}" stroke-width="3"/>
        <path d="M78 128 L106 128 M134 128 L162 128" stroke="${ink}" stroke-width="5"/>
        <path d="M84 140 a8 7 0 0 0 16 0 Z M140 140 a8 7 0 0 0 16 0 Z" fill="${ink}"/>
        <path d="M120 140 L114 166 L126 166" stroke="${ink}" stroke-width="3" fill="none"/>
        <path d="M90 186 L150 186" stroke="${ink}" stroke-width="4"/>
        <path d="M96 182 L96 192 M108 182 L108 192 M120 182 L120 192 M132 182 L132 192 M144 182 L144 192" stroke="${ink}" stroke-width="2"/>
        <path d="M70 108 L84 112 M76 104 L74 116" stroke="${ink}" stroke-width="3"/>`),
    },
    cat: {
      label: 'Black Cat',
      svg: () => wrap(`${bg('#e0b46a', '#9b4a1a')}
        <path d="M30 300 C30 240 70 214 120 214 C170 214 210 240 210 300 Z" fill="#1d1a1a"/>
        <path d="M58 172 C50 120 54 82 62 40 L100 82 C112 78 128 78 140 82 L178 40 C186 82 190 120 182 172 C176 206 150 222 120 222 C90 222 64 206 58 172 Z" fill="#1d1a1a" stroke="#000" stroke-width="3"/>
        <path d="M70 58 L94 84 L74 92 Z M170 58 L146 84 L166 92 Z" fill="#6b3a3a"/>
        <ellipse cx="96" cy="140" rx="16" ry="18" fill="#d9e04a"/><ellipse cx="144" cy="140" rx="16" ry="18" fill="#d9e04a"/>
        <ellipse cx="96" cy="140" rx="4" ry="15" fill="#1d1a1a"/><ellipse cx="144" cy="140" rx="4" ry="15" fill="#1d1a1a"/>
        <path d="M114 168 L126 168 L120 176 Z" fill="#c97a7a"/>
        <path d="M120 176 Q112 186 104 182 M120 176 Q128 186 136 182" stroke="#8a8a8a" stroke-width="2.5" fill="none"/>
        <path d="M60 166 L100 172 M58 180 L100 178 M180 166 L140 172 M182 180 L140 178" stroke="#bdbdbd" stroke-width="2"/>`),
    },
    werewolf: {
      label: 'Werewolf',
      svg: () => wrap(`${bg('#b8b8c8', '#3d3f5a')}
        <circle cx="190" cy="56" r="34" fill="#f1e6b8"/>
        ${shoulders('#5a4232')}
        <path d="M60 230 L70 210 L80 232 L92 208 L100 234 M140 234 L148 208 L160 232 L170 210 L180 230" fill="#5a4232" stroke="${ink}" stroke-width="3"/>
        <path d="M72 70 L88 20 L108 66 Q120 62 132 66 L152 20 L168 70 C186 92 188 132 176 162 L196 176 L162 182 C152 206 136 220 120 220 C104 220 88 206 78 182 L44 176 L64 162 C52 132 54 92 72 70 Z" fill="#6e5440" stroke="${ink}" stroke-width="4"/>
        <path d="M84 44 L92 64 L100 60 Z M156 44 L148 64 L140 60 Z" fill="#c78f7a"/>
        <path d="M96 150 C96 130 106 120 120 120 C134 120 144 130 144 150 C144 186 134 200 120 200 C106 200 96 186 96 150 Z" fill="#a88a6e" stroke="${ink}" stroke-width="3"/>
        <ellipse cx="120" cy="140" rx="12" ry="8" fill="${ink}"/>
        <path d="M84 110 L108 118 M156 110 L132 118" stroke="${ink}" stroke-width="5"/>
        <ellipse cx="96" cy="124" rx="7" ry="5" fill="#f1c232"/><ellipse cx="144" cy="124" rx="7" ry="5" fill="#f1c232"/>
        <path d="M104 172 Q120 184 136 172" stroke="${ink}" stroke-width="3" fill="none"/>
        <path d="M108 174 L111 186 L114 176 Z M126 176 L129 186 L132 174 Z" fill="#fff" stroke="${ink}" stroke-width="1.5"/>`),
    },
  };

  global.Portraits = P;
})(typeof window !== 'undefined' ? window : globalThis);
