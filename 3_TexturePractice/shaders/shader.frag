// Fragment shader:
// ================

#version 330 core
in vec3 ourColor;
in vec2 TexCoord;

out vec4 color;

uniform float mixValue;

// Texture samplers
uniform sampler2D ourTexture1;
uniform sampler2D ourTexture2;

void main()
{
    //color = texture(ourTexture, TexCoord);
	//color = texture(ourTexture, TexCoord) * vec4(ourColor, 1.0f);

	// Linearly interpolate between both textures (second texture is only slightly combined)
	color = mix(texture(ourTexture1, TexCoord), texture(ourTexture2, TexCoord), mixValue);
}