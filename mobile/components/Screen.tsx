import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../constants/theme';
export default function Screen({title,subtitle,children,onRefresh}: PropsWithChildren<{title:string;subtitle?:string;onRefresh?:()=>void}>) { return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><View style={s.head}><View style={{flex:1}}><Text style={s.title}>{title}</Text>{subtitle&&<Text style={s.sub}>{subtitle}</Text>}</View>{onRefresh&&<Pressable onPress={onRefresh} style={s.refresh}><Ionicons name="refresh-outline" size={20} color={colors.tealBright}/></Pressable>}</View>{children}</ScrollView></SafeAreaView>; }
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},content:{padding:16,paddingBottom:42},head:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:16},title:{fontSize:27,fontWeight:'900',color:colors.navyDark},sub:{fontSize:12,color:colors.muted,marginTop:4,lineHeight:18},refresh:{width:42,height:42,borderRadius:14,backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'}});
