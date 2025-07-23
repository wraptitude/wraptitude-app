import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const buttonWidth = (width - 60) / 2;

export const appStyles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    // backgroundColor: '#040404',
  },
  logoImage: {
    width: 200,
    height: 100, // Adjust these dimensions based on your logo's aspect ratio
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  signInContainer: {
    padding: 20,
    backgroundColor: 'transparent',
    flex: 1,
    // backgroundColor: '#040404',
  },
  signInTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    // fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 5,
  },
  phoneFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  countryCodePicker: {
    width: 120,
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
  },
  signInButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpContainer: {
    padding: 20,
    backgroundColor: 'transparent',
    // backgroundColor: '#040404',
  },
  signUpTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: '#c70628',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signInLinkText: {
    color: '#c70628',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestModeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  forgotPasswordContainer: {
    padding: 20,
    backgroundColor: '#040404',
  },
  forgotPasswordTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sendCodeButton: {
    backgroundColor: '#c70628',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToSignIn: {
    alignItems: 'center',
    marginTop: 20,
  },
  backToSignInText: {
    color: '#c70628',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rootContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    // backgroundColor: '#040404',
  },
  backgroundImage: {
    position: 'absolute',
    // width: width,
    // height: height,
    // opacity: 0.5,
    // zIndex: 0,
    // flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});