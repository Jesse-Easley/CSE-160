uniform float thickness;
void main() {
    //expand the vertex along its normal
    vec3 newPosition = position + normal * thickness;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}