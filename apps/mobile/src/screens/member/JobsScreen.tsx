import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { C } from '@/theme/colors';

const ROLE_FILTERS = [['','All'],['JOB_SEEKER','Job Seeker'],['INTERN','Intern'],['FRESHER','Fresher'],['FREELANCER','Freelancer'],['CONSULTANT','Consultant'],['TRAINER','Trainer']];
const MODE_FILTERS = [['','Any Mode'],['WFH','WFH'],['ON_SITE','On-Site'],['HYBRID','Hybrid']];

export function JobsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');
  const [role,   setRole]   = useState('');
  const [mode,   setMode]   = useState('');
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['m-listings', query, role, mode],
    queryFn: ({ pageParam = 1 }) => listingsApi.browse({ search: query || undefined, role: role || undefined, mode: mode || undefined, page: pageParam, limit: 15 }),
    getNextPageParam: (last: any) => last.page < last.totalPages ? last.page + 1 : undefined,
    initialPageParam: 1,
  });

  const listings = data?.pages.flatMap((p: any) => p.data) ?? [];
  const total    = data?.pages[0]?.total ?? 0;

  const onSearch = (v: string) => {
    setSearch(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setQuery(v); }, 400);
  };

  const renderItem = useCallback(({ item }: any) => (
    <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id, role: item.targetRoleType })} />
  ), []);

  return (
    <SafeAreaView style={s.safe}>
      {/* Search bar */}
      <View style={s.searchBar}>
        <Text style={{ fontSize: 14, color: C.faint }}>🔍</Text>
        <TextInput value={search} onChangeText={onSearch} placeholder="Search jobs, skills…"
          placeholderTextColor={C.faint} style={s.searchInput} />
      </View>

      {/* Role filter pills */}
      <FlatList
        horizontal showsHorizontalScrollIndicator={false} data={ROLE_FILTERS}
        keyExtractor={i => i[0]}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}
        renderItem={({ item: [v, l] }) => (
          <TouchableOpacity onPress={() => setRole(v === role ? '' : v)}
            style={[s.pill, role === v && s.pillOn]}>
            <Text style={[s.pillTxt, role === v && s.pillTxtOn]}>{l}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Results */}
      {isLoading ? (
        <View style={s.center}><ActivityIndicator color={C.gold2} size="large" /></View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={<Text style={s.total}>{total} listings</Text>}
          ListEmptyComponent={<View style={s.center}><Text style={{ color: C.muted }}>No listings found.</Text></View>}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={C.gold2} style={{ marginVertical: 16 }} /> : null}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:C.deep },
  searchBar:  { flexDirection:'row', alignItems:'center', gap:8, margin:16, marginBottom:8, backgroundColor:'rgba(255,255,255,0.05)', borderRadius:50, paddingHorizontal:16, paddingVertical:10, borderWidth:1, borderColor:C.bf },
  searchInput:{ flex:1, color:C.offwhite, fontSize:13 },
  pill:       { paddingHorizontal:14, paddingVertical:7, borderRadius:50, borderWidth:1, borderColor:C.bf, backgroundColor:'transparent' },
  pillOn:     { backgroundColor:'rgba(212,160,23,0.12)', borderColor:C.border },
  pillTxt:    { fontSize:11, color:C.muted, fontWeight:'600' },
  pillTxtOn:  { color:C.gold3 },
  total:      { fontSize:11, color:C.muted, marginBottom:12 },
  center:     { flex:1, alignItems:'center', justifyContent:'center', padding:40 },
});
