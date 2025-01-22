import CustomButton from "@/components/CustomButton"
import InputField from "@/components/InputField"
import OAuth from "@/components/OAuth"
import { icons, images } from "@/constants"
import { useSignUp } from "@clerk/clerk-expo"
import { Link, router } from "expo-router"
import { useState } from "react"
import { Alert, Image, ScrollView, Text, TextInput, View } from "react-native"
import {ReactNativeModal} from "react-native-modal"


const SignUp = () => {
  const [form,setForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const { isLoaded, signUp, setActive } = useSignUp()

  const [verification, setVerification] = useState({
    state: 'default',
    error:'',
    code:''
  })
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setVerification({...verification, state:'pending'})
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      Alert.alert("Error", err.errors[0].longMessage)
    
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        //ToDO: Crete a DB User
        await setActive({ session: signUpAttempt.createdSessionId })
        setVerification({...verification,state:"success"})
        
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        setVerification({...verification,error:"Verification failed",state:"failed"})
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err:any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setVerification({...verification,error:err.errors[0].longMessage,state:"failed"})
      console.error(JSON.stringify(err, null, 2))
    }
  }


 
  return (
    <ScrollView>
    <View className="flex-1 bg-white">
        <View className="relative w-full h-[170px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[170px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />
          <OAuth />
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>
        <ReactNativeModal isVisible={verification.state==='pending'}
        onModalHide={()=>{
          if(verification.state ==='success') setShowSuccessModal(true)
        }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <Text className="text-2xl font-JakartaExtraBold mb-2 ">Verified</Text>
          <Text className="font-Jakarta  mb-5">We've Sent a Verifiction code to {form.email}</Text>
          <InputField label="Code" icon={icons.lock} placeholder="12345"keyboardType="numeric"
          value={verification.code}
          onChangeText={(code) => setVerification({ ...verification, code})} />
          {verification.error && (
            <Text className="text-red-500 text-sm mt-1">{verification.error}</Text>
          )}
          <CustomButton title="Verify Email" onPress={onVerifyPress} className="mt-5 bg-success-500" />
          </View>
        </ReactNativeModal>
        {/* verification model */}
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image source={images.check} className="w-[110px] h-[110px] mx-auto my-5"/>
          <Text className="text-3xl font-JakartaBold text-center">Verified</Text>
          <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">Yo have successfully verified yor account.</Text>
          <CustomButton
          title="Browse Home"
          onPress={()=>{
            setShowSuccessModal(false) 
            router.push("/(root)/(tabs)/home")} }
          className="mt-5"
          />
          </View>

        </ReactNativeModal>
      </View>
      </ScrollView>
  )
}

export default SignUp