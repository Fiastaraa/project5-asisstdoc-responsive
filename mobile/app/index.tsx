import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
export default function Index(){const {user,isAuthenticated,isHydrating}=useAuth();if(isHydrating)return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></View>;if(!isAuthenticated||!user)return <Redirect href="/login"/>;return <Redirect href={`/dashboard/${user.role.toLowerCase()}`}/>;}
