import { View, Text } from 'react-native'
import React from 'react'
import {styled} from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";


const SafeAreaView = styled(RNSafeAreaView);

const subscriptions = () => {
  return (
    <SafeAreaView className='flex-1 bg-background p-5'>
      <Text>Subscription</Text>
    </SafeAreaView>
  )
}

export default subscriptions