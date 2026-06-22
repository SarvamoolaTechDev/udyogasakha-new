import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { C } from '@/theme/colors';

const ROLE_FILTERS   = [['',''+'All'],['JOB_SEEKER','Job Seeker'],['INTERN','Intern'],['FRESHER','Fresher'],['FREELANCER','Freelancer'],['CONSULTANT','Consultant'],['TRAINER','Trainer'],['RFP_PROVIDER','RFP']];
const MARKET_FILTERS = [['','Any Market'],['IT_FIELD','IT Field'],['NON_IT_FIELD','Non-IT Field'],['SERVICES','Services']];
const MODE_FILTERS   = [['','Any Mode'],['WFH','WFH'],['ON_SITE','On-Site'],['HYBRID','Hybrid'],['OFF_SITE','Off-Site']];
const PAID_FILTERS   = [['','Any Payment'],['PAID','Paid'],['STIPEND','Stipend'],['UNPAID','Unpaid'],['NEGOTIABLE','Negotiable']];
const CERT_FILTERS   = [['','Any'],['YES','Certificate Provided']];

export function JobsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');
  const [role,   setRole]   = useState('');
  const [market, setMarket] = useState('');
  const [mode,   setMode]   = useState('');
  const [paid,   setPaid]   = useState('');
  const [cert,   setCert]   = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const activeCount = [market, mode, paid, cert].filter(Boolean).length;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['m-listings', query, role, market, mode, paid, cert],
    queryFn: ({ pageParam = 1 }) => listingsApi.browse({
      search: query || undefined, role: role || undefined, market: market || undefined,
      mode: mode || undefined, paid: paid || undefined, cert: cert || undefined,
      page: pageParam, limit: 15,
    }),
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

  const clearFilters = () => { setMarket(''); setMode(''); setPaid(''); setCert(''); };

  const renderItem = useCallback(({ item }: any) => (
    <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id, role: item.targetRoleType })} />
  ), []);

  const FilterGroup = ({ title, options, value, onChange }: any) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={s.filterGroupTitle}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map(([v, l]: string[]) => (
          <TouchableOpacity key={v} onPress={() => onChange(v === value ? '' : v)}
            style={[s.filterChip, value === v && s.filterChipOn]}>
            <Text style={[s.filterChipTxt, value === v && s.filterChipTxtOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Search + filter button */}
      <View style={s.topRow}>
        <View style={s.searchBar}>
          <Text style={{ fontSize: 14, color: C.faint }}>🔍</Text>
          <TextInput value={search} onChangeText={onSearch} placeholder="Search jobs, skills…"
            placeholderTextColor={C.faint} style={s.searchInput} />
        </View>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={[s.filterBtn, activeCount > 0 && s.filterBtnOn]}>
          <Text style={[s.filterBtnTxt, activeCount > 0 && s.filterBtnTxtOn]}>
            🔧{activeCount > 0 ? ` ${activeCount}` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Role filter pills (always visible) */}
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

      {/* Filter bottom sheet — Market / Mode / Payment / Certificate */}
      <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowFilters(false)}>
          <View style={s.sheet} onStartShouldSetResponder={() => true}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Filters</Text>
              <TouchableOpacity onPress={clearFilters}><Text style={s.clearBtn}>Clear all</Text></TouchableOpacity>
            </View>
            <View style={{ padding: 18 }}>
              <FilterGroup title="Market"     options={MARKET_FILTERS} value={market} onChange={setMarket} />
              <FilterGroup title="Work Mode"  options={MODE_FILTERS}   value={mode}   onChange={setMode}   />
              <FilterGroup title="Payment"    options={PAID_FILTERS}   value={paid}   onChange={setPaid}   />
              <FilterGroup title="Certificate"options={CERT_FILTERS}   value={cert}   onChange={setCert}   />
            </View>
            <TouchableOpacity style={s.applyBtn} onPress={() => setShowFilters(false)}>
              <Text style={s.applyBtnTxt}>Show {total} Results</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:C.deep },
  topRow:      { flexDirection:'row', gap:8, marginHorizontal:16, marginTop:16, marginBottom:8 },
  searchBar:   { flex:1, flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(255,255,255,0.05)', borderRadius:50, paddingHorizontal:16, paddingVertical:10, borderWidth:1, borderColor:C.bf },
  searchInput: { flex:1, color:C.offwhite, fontSize:13 },
  filterBtn:   { paddingHorizontal:14, justifyContent:'center', borderRadius:50, borderWidth:1, borderColor:C.bf },
  filterBtnOn: { backgroundColor:'rgba(212,160,23,0.12)', borderColor:C.border },
  filterBtnTxt:{ fontSize:13, color:C.muted, fontWeight:'600' },
  filterBtnTxtOn:{ color:C.gold3 },
  pill:        { paddingHorizontal:14, paddingVertical:7, borderRadius:50, borderWidth:1, borderColor:C.bf, backgroundColor:'transparent' },
  pillOn:      { backgroundColor:'rgba(212,160,23,0.12)', borderColor:C.border },
  pillTxt:     { fontSize:11, color:C.muted, fontWeight:'600' },
  pillTxtOn:   { color:C.gold3 },
  total:       { fontSize:11, color:C.muted, marginBottom:12 },
  center:      { flex:1, alignItems:'center', justifyContent:'center', padding:40 },
  overlay:     { flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'flex-end' },
  sheet:       { backgroundColor:C.cardBg, borderTopLeftRadius:20, borderTopRightRadius:20, borderWidth:1, borderColor:C.border, maxHeight:'80%' },
  sheetHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:18, borderBottomWidth:1, borderBottomColor:C.bf },
  sheetTitle:  { color:C.white, fontSize:15, fontWeight:'700' },
  clearBtn:    { color:C.gold3, fontSize:12, fontWeight:'600' },
  filterGroupTitle: { color:C.gold3, fontSize:10, fontWeight:'700', letterSpacing:1, textTransform:'uppercase', marginBottom:10 },
  filterChip:    { paddingHorizontal:12, paddingVertical:7, borderRadius:50, borderWidth:1, borderColor:C.bf },
  filterChipOn:  { backgroundColor:'rgba(212,160,23,0.12)', borderColor:C.border },
  filterChipTxt: { fontSize:11, color:C.muted, fontWeight:'600' },
  filterChipTxtOn:{ color:C.gold3 },
  applyBtn:    { backgroundColor:C.gold2, margin:18, marginTop:4, borderRadius:50, paddingVertical:14, alignItems:'center' },
  applyBtnTxt: { color:C.navy, fontWeight:'700', fontSize:13 },
});
