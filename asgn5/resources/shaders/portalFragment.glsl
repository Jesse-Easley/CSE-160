varying vec4 vPos;
uniform sampler2D portalTexture;
void main() {
    vec2 vCoords = vPos.xy;
    vCoords /= vPos.w;
    vCoords = vCoords * 0.5 + 0.5;
      
    vec4 portalColor = texture2D(portalTexture, vCoords);
    gl_FragColor = portalColor;
}