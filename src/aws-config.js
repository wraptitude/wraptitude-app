// Custom AWS Configuration for existing User Pool
// This file won't be overwritten by Amplify CLI

const awsConfig = {
    "aws_project_region": "us-east-2",
    "aws_cognito_region": "us-east-2",
    "aws_user_pools_id": "us-east-2_BL1Vs8X4n",
    "aws_user_pools_web_client_id": "7e07lmvei9ftbl1j49ktdqldjp",
    "aws_user_pools_mobile_client_id": "sosuuaph64jtvh2s1ftktj9ej",
    "aws_cognito_username_attributes": [
      "PHONE_NUMBER"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
      "PHONE_NUMBER"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [],
    "aws_cognito_password_protection_settings": {
      "passwordPolicyMinLength": 6,
      "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": []
  };
  
  export default awsConfig;