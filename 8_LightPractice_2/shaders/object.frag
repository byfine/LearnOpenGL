#version 330 core

// ����
struct Material
{
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};


// ƽ�й�
struct DirLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  

// �����
struct PointLight {
    vec3 position;

	// ˥����ʽ����
    float constant;		// ������
    float linear;		// һ����
    float quadratic;	// ������

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  

// �۹��
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

#define NR_POINT_LIGHTS 4		// �����Դ����

uniform vec3 viewPos;			// �۲���λ��
uniform Material material;		// ����

uniform DirLight dirLight;		// ƽ�й�
uniform PointLight pointLights[NR_POINT_LIGHTS];	// �������
uniform SpotLight spotLight;	// �۹��

in vec2 TexCoords;	// ��������
in vec3 Normal;		// ����
in vec3 FragPos;	// Ƭ��λ��

out vec4 color;


// ����ƽ�й⺯��
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);  

// ��������⺯��
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);  

// �����۹�ƺ���
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);


void main()
{
	// һЩ����
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);

	// ��һ��������ƽ�й���
    vec3 result = CalcDirLight(dirLight, norm, viewDir);

    // �ڶ��������㶥�����
    for(int i = 0; i < NR_POINT_LIGHTS; i++){
		result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);
	}        

    // ������������ Spot light
    //result += CalcSpotLight(spotLight, norm, FragPos, viewDir);

    color = vec4(result, 1.0);
}



// ����ƽ�й�Ĺ�����ɫ
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir){

	// ���߷��򡣹�Դ����direction����Ϊ�ӹ�Դ�������˴�lightDir����Ϊ��Ƭ�ε���Դ�ķ������ԼӸ��š�
	vec3 lightDir = normalize(-light.direction);
	
	// ����������ǿ��
	float diff = max(dot(normal, lightDir), 0.0);

	// ������������һ������Ϊ��Դָ��Ƭ�εķ�������Ҫ�Ӹ����� 
	vec3 reflectDir = reflect(-lightDir, normal); 
	// ���㷴��ǿ��
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

	// �ϲ��������շ���
	vec3 texDiffuse = vec3(texture(material.diffuse, TexCoords));
    vec3 ambient  = light.ambient  * texDiffuse;
    vec3 diffuse  = light.diffuse  * diff * texDiffuse;
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
	
	return (ambient + diffuse + specular);
}


// ���㶨���Ĺ�����ɫ
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
	// ���߷��� ����Ƭ��λ�ü�ȥ���λ��
	vec3 lightDir = normalize(light.position - fragPos);

	// ����������ǿ��
    float diff = max(dot(normal, lightDir), 0.0);

	// ���㾵�淴��
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	
	// ����˥��
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

	// �����������ϲ�
	vec3 texDiffuse = vec3(texture(material.diffuse, TexCoords));
    vec3 ambient  = light.ambient  * texDiffuse;
    vec3 diffuse  = light.diffuse  * diff * texDiffuse;
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));

	ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;

    return (ambient + diffuse + specular);
}



// ����۹�ƵĹ�����ɫ
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);

    // ����������ǿ��
    float diff = max(dot(normal, lightDir), 0.0);

    // ���㾵�淴��
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

    // ����˥��
    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

    // �ƹ�ǿ�ȼ���
    float theta = dot(lightDir, normalize(-light.direction)); // ������߷���͵ƹⷽ��ĽǶ�ֵ
    float epsilon = light.cutOff - light.outerCutOff;  // ��������׵��ǶȲ�
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0); // �������ǿ�ȡ�������׵��Ϊ0��С����׵��Ϊ1������׵��֮�����

    // ��Ͻ��
	vec3 texDiffuse = vec3(texture(material.diffuse, TexCoords));
    vec3 ambient = light.ambient * texDiffuse;
    vec3 diffuse = light.diffuse * diff * texDiffuse;
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));

    ambient *= attenuation * intensity;
    diffuse *= attenuation * intensity;
    specular *= attenuation * intensity;

    return (ambient + diffuse + specular);
}