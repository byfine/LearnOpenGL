#version 330 core

// 材质
struct Material
{
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};
uniform Material material; //材质

// 光照属性
struct Light
{
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
uniform Light light;


uniform vec3 lightPos; // 灯光位置
uniform vec3 viewPos; // 观察者位置

in vec2 TexCoords;

in vec3 Normal;  
in vec3 FragPos;  

out vec4 color;

void main()
{
	
	// 环境光
	vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));

	// 漫反射
	vec3 norm = normalize(Normal); // 标准化法线
	vec3 lightDir = normalize(lightPos - FragPos); //计算并标准化光线向量
    float diff = max(dot(norm, lightDir), 0.0);
	vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords));  // 计算漫反射

	// 镜面高光
	vec3 viewDir = normalize(viewPos - FragPos); // 视线向量
	vec3 reflectDir = reflect(-lightDir, norm); // 反射向量，第一个参数要求为光源指向片段的方向，所以要加个负号
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
	
    vec3 result = ambient + diffuse + specular;
    color = vec4(result, 1.0f);
}