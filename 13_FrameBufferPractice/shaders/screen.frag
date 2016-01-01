#version 330 core
in vec2 TexCoords;
out vec4 color;

uniform sampler2D screenTexture;

void main()
{
	// --------- 正常 ---------
    color = texture(screenTexture, TexCoords);
	
	// --------- 反相 ---------
    //color = vec4(vec3(1 - texture(screenTexture, TexCoords)), 1.0);

	// --------- 灰度 ---------
	//color = texture(screenTexture, TexCoords);
    //float average = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
    //color = vec4(average, average, average, 1.0);


	/*

	// ---------- kernel ---------
	float offset = 1.0 / 300;  

	// 偏移量数组
	vec2 offsets[9] = vec2[](
        vec2(-offset, offset),  // top-left
        vec2(0.0f,    offset),  // top-center
        vec2(offset,  offset),  // top-right
        vec2(-offset, 0.0f),    // center-left
        vec2(0.0f,    0.0f),    // center-center
        vec2(offset,  0.0f),    // center-right
        vec2(-offset, -offset), // bottom-left
        vec2(0.0f,    -offset), // bottom-center
        vec2(offset,  -offset)  // bottom-right
    );

	
	// kernel数组（锐化效果）
//	float kernel[9] = float[](
//        -1, -1, -1,
//        -1,  9, -1,
//        -1, -1, -1
//    );	

	// blur 模糊
//	float kernel[9] = float[](
//		1.0 / 16, 2.0 / 16, 1.0 / 16,
//		2.0 / 16, 4.0 / 16, 2.0 / 16,
//		1.0 / 16, 2.0 / 16, 1.0 / 16  
//	);

	// 边检测
	float kernel[9] = float[](
        1, 1, 1,
        1, -8, 1,
        1, 1, 1
    );


    vec3 sampleTex[9];
    for(int i = 0; i < 9; i++)
    {
		// 将每个偏移量加到当前纹理坐标
        sampleTex[i] = vec3(texture(screenTexture, TexCoords.st + offsets[i]));
    }

    vec3 col;
    for(int i = 0; i < 9; i++){
		// kernel的值乘以这些纹理值
		col += sampleTex[i] * kernel[i];
	}       

    color = vec4(col, 1.0);

	*/
}