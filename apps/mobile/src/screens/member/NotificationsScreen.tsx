import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { C } from '@/theme/colors';
import { Button } from '@/components/UI';

export function NotificationsScreen() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['m-notifs', page, unreadOnly],
    queryFn:  () => notificationsApi.list({ unread: unreadOnly || undefined, page, limit: 20 }),
  });

  const markAllMut = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess:  () => qc.invalidateQueries({ queryKey:['m-notifs'] }),
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey:['m-notifs'] }),
  });

  const notifications: any[] = (data as any)?.data ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Notifications</Text>
        <TouchableOpacity onPress={() => markAllMut.mutate()}>
          <Text style={s.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Unread-only toggle */}
      <TouchableOpacity onPress={() => { setUnreadOnly(v => !v); setPage(1); }} style={s.toggleRow} activeOpacity={0.7}>
        <View style={[s.switchTrack, unreadOnly && s.switchTrackOn]}>
          <View style={[s.switchThumb, unreadOnly && s.switchThumbOn]} />
        </View>
        <Text style={s.toggleLabel}>Unread only</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={s.center}><ActivityIndicator color={C.gold2} size="large" /></View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding:16, gap:10 }}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={{ fontSize:32, marginBottom:12 }}>🔔</Text>
              <Text style={{ color:C.muted }}>No notifications yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} onPress={() => { if (!item.read) markReadMut.mutate(item.id); }}
              style={[s.card, item.read && s.cardRead]}>
              <View style={s.cardRow}>
                {!item.read && <View style={s.dot} />}
                <View style={{ flex:1 }}>
                  <Text style={[s.subject, item.read && { color:C.muted }]}>{item.subject}</Text>
                  <Text style={s.body} numberOfLines={2}>{item.body}</Text>
                  <Text style={s.time}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={s.pagRow}>
                <Button label="← Prev" variant="outline" onPress={() => setPage(p=>p-1)} disabled={page===1} style={{ flex:1 }} />
                <Text style={s.pageNum}>{page}/{totalPages}</Text>
                <Button label="Next →" variant="outline" onPress={() => setPage(p=>p+1)} disabled={page===totalPages} style={{ flex:1 }} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:     { flex:1, backgroundColor:C.deep },
  header:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, paddingBottom:8 },
  title:    { fontSize:20, fontWeight:'700', color:C.white },
  markAll:  { fontSize:12, color:C.gold3, fontWeight:'600' },
  toggleRow:{ flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:16, paddingBottom:12 },
  switchTrack:  { width:36, height:20, borderRadius:10, backgroundColor:'rgba(255,255,255,0.1)', borderWidth:1, borderColor:C.bf, justifyContent:'center' },
  switchTrackOn:{ backgroundColor:'rgba(212,160,23,0.5)', borderColor:C.border },
  switchThumb:  { width:14, height:14, borderRadius:7, backgroundColor:'#fff', marginLeft:3 },
  switchThumbOn:{ marginLeft:19 },
  toggleLabel:  { fontSize:12, color:C.muted },
  center:   { flex:1, alignItems:'center', justifyContent:'center', padding:40 },
  card:     { backgroundColor:C.cardBg, borderRadius:14, borderWidth:1, borderColor:C.border, padding:14 },
  cardRead: { opacity:0.65 },
  cardRow:  { flexDirection:'row', alignItems:'flex-start', gap:10 },
  dot:      { width:8, height:8, borderRadius:4, backgroundColor:C.gold2, marginTop:6, flexShrink:0 },
  subject:  { fontSize:13, fontWeight:'700', color:C.white, marginBottom:4 },
  body:     { fontSize:12, color:C.muted, lineHeight:18, marginBottom:6 },
  time:     { fontSize:10, color:C.faint },
  pagRow:   { flexDirection:'row', alignItems:'center', gap:10, marginTop:12 },
  pageNum:  { fontSize:12, color:C.muted, textAlign:'center', flex:0.5 },
});
