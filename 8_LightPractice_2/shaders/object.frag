#version 330 core

// 材质
struct Material
{
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};


// 平行光
struct DirLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  

// 定点光
struct PointLight {
    vec3 position;

	// 衰减公式参数
    float constant;		// 常数项
    float linear;		// 一次项
    float quadratic;	// 二次项

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  

// 聚光灯
struct SpotLight {
    vec3 position;
    vec3 direction;
    float cutOff;
    float outerCutOff;
	
    float constant;
    float linear;
    float quadratic;
  
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;       
};

#define NR_POINT_LIGHTS 4		// 顶点光源数量

uniform vec3 viewPos;			// 观察者位置
uniform Material material;		// 材质

uniform DirLight dirLight;		// 平行光
uniform PointLight pointLights[NR_POINT_LIGHTS];	// 点光数组
uniform SpotLight spotLight;	// 聚光灯

in vec2 TexCoords;	// 材质坐标
in vec3 Normal;		// 法线
in vec3 FragPos;	// 片段位置

out vec4 color;


// 声明平行光函数
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);  

// 声明定点光函数
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);  

// 声明聚光灯函数
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);


void main()
{
	// 一些属性
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);

	// 第一步，计算平行光照
    vec3 result = CalcDirLight(dirLight, norm, viewDir);

    // 第二步，计算顶点光照
    for(int i = 0; i < NR_POINT_LIGHTS; i++){
		result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);
	}        

    // 第三部，计算 Spot light
    //result += CalcSpotLight(spotLight, norm, FragPos, viewDir);

    color = vec4(result, 1.0);
}



// 计算平行光的光照颜色
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir){

	// 光线方向。光源方向direction定义为从光源发出，此处lightDir设置为从片段到光源的方向，所以加负号。
	vec3 lightDir = normalize(-light.direction);
	
	// 计算漫反射强度
	float diff = max(dot(normal, lightDir), 0.0);

	// 反射向量，第一个参数为光源指向片段的方向，所以要加个负号 
	vec3 reflectDir = reflect(-lightDir, normal); 
	// 计算反射强度
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

	// 合并各个光照分量
	vec3 texDiffuse = vec3(texture(material.diffuse, TexCoords));
    vec3 ambient  = light.ambient  * texDiffuse;
    vec3 diffuse  = light.diffuse  * diff * texDiffuse;
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
	
	return (ambient + diffuse + specular);
}


// 计算定点光的光照颜色
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
	// 光线方向 等于片段位置减去光的位置
	vec3 lightDir = normalize(light.position - fragPos);

	// 计算漫反射强度
    float diff = max(dot(normal, lightDir), 0.0);

	// 计算镜面反射
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	
	// 计算衰减
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

	// 将各个分量合并
	vec3 texDiffuse = vec3(texture(material.diffuse, TexCoords));
    vec3 ambient  = light.ambient  * texDiffuse;
    vec3 diffuse  = light.diffuse  * diff * texDiffuse;
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));

	ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;

    return (ambient + diffuse + specular);
}



// 计算聚光灯的光照颜色
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);

    // 计算漫反射强度
    float diff = max(dot(normal, lightDir), 0.0);

    // 计算镜面反射
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

    // 计算衰减
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

    // 灯光强度计算
    float theta = dot(lightDir, normalize(-light.direction)); // 计算光线方向和灯光方向的角度值
    float epsilon = light.cutOff - light.outerCutOff;  // 计算内外椎体角度差
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0); // 计算光线强度。大于外椎体为0，小于内椎体为1，内外椎体之间过渡

    // 组合结果
	vec3 texDiffuse = vec3(texture(material.diffuse, TexCoords));
    vec3 ambient = light.ambient * texDiffuse;
    vec3 diffuse = light.diffuse * diff * texDiffuse;
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));

    ambient *= attenuation * intensity;
    diffuse *= attenuation * intensity;
    specular *= attenuation * intensity;

    return (ambient + diffuse + specular);
}