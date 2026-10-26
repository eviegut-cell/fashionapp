import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmail, signOutFromMiModa, signUpWithEmail } from './src/lib/auth';
import { isSupabaseConfigured } from './src/lib/supabase';
import { moderationCheck } from './src/lib/moderation';

type TabKey = 'quick' | 'thread' | 'profile';
type VoteType = 'love' | 'pass';

type QuickVote = {
  id: number;
  user: string;
  caption: string;
  vibe: string;
  palette: [string, string];
  emoji: string;
  love: number;
  pass: number;
  photo?: string | null;
  selectedVote?: VoteType | null;
};

type Comment = {
  author: string;
  text: string;
};

type DiscussionPost = {
  id: number;
  user: string;
  title: string;
  description: string;
  mood: string;
  comments: Comment[];
  photo?: string | null;
};

type InboxItem = {
  id: number;
  from: string;
  text: string;
  time: string;
};

const photoOptions = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
];

const quickSeed: QuickVote[] = [
  {
    id: 1,
    user: 'Maya Z.',
    caption: 'Monochrome tailoring and a sharp heel for the gallery after dark.',
    vibe: 'after-hours polish',
    palette: ['#d8b69d', '#f1e5dc'],
    emoji: '👗',
    love: 84,
    pass: 16,
    photo: photoOptions[0],
  },
  {
    id: 2,
    user: 'Leah K.',
    caption: 'Soft cargos, cropped knit, and silver hardware for a city stroll.',
    vibe: 'day-to-night edge',
    palette: ['#c6b7a8', '#f7efe8'],
    emoji: '🧥',
    love: 71,
    pass: 29,
    photo: photoOptions[1],
  },
  {
    id: 3,
    user: 'Noa M.',
    caption: 'White blazer, cream top, and a tiny bag to keep the look quiet luxury.',
    vibe: 'quiet luxury',
    palette: ['#e2d7cf', '#f5efe8'],
    emoji: '👜',
    love: 91,
    pass: 9,
    photo: photoOptions[2],
  },
];

const discussionSeed: DiscussionPost[] = [
  {
    id: 1,
    user: 'Iris L.',
    title: 'Best jacket for a spring wedding?',
    description: 'I want something structured but still lighter than a blazer. What do you think works best with silk dresses?',
    mood: 'dressy casual',
    comments: [
      { author: 'Mila', text: 'A soft ivory column with a sculpted jacket feels very editorial.' },
      { author: 'Jules', text: 'Go for a slightly oversized satin lapel and keep the silhouette clean.' },
    ],
  },
  {
    id: 2,
    user: 'Rae D.',
    title: 'Heels or flats for the airport?',
    description: 'Trying to look pulled together without sacrificing comfort for a long travel day. I need genius-level outfit advice.',
    mood: 'travel style',
    comments: [
      { author: 'Nina', text: 'A pointed ballet flat with a sharp trouser is instantly chic.' },
      { author: 'Ari', text: 'If you want height, a sleek slingback is the move.' },
    ],
  },
];

const inboxSeed: InboxItem[] = [
  { id: 1, from: 'Mila', text: 'You got so many likes on your last fit. The knit detail was genius.', time: '2m ago' },
  { id: 2, from: 'Jules', text: 'I replied to your thread about leather pants and boots. See it?', time: '1h ago' },
  { id: 3, from: 'Ari', text: 'Your new lookbook is going viral in the creative crowd.', time: '4h ago' },
];

const tabLabels: Array<{ key: TabKey; label: string }> = [
  { key: 'quick', label: 'Quick' },
  { key: 'thread', label: 'Thread' },
  { key: 'profile', label: 'Profile' },
];

const checkModeration = (value: string) => {
  const result = moderationCheck(value);
  return result.isAllowed ? null : result.reason;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('quick');
  const [quickVotes, setQuickVotes] = useState<QuickVote[]>(quickSeed);
  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>(discussionSeed);
  const [draftQuick, setDraftQuick] = useState('');
  const [draftDiscussion, setDraftDiscussion] = useState('');
  const [discussionCommentDraft, setDiscussionCommentDraft] = useState<Record<number, string>>({});
  const [displayName, setDisplayName] = useState('Ava Stone');
  const [username, setUsername] = useState('ava.stone');
  const [email, setEmail] = useState('ava@example.com');
  const [password, setPassword] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(photoOptions[0]);
  const [threadPhotoUrl, setThreadPhotoUrl] = useState<string | null>(photoOptions[1]);

  const totalVotes = useMemo(
    () => quickVotes.reduce((sum, post) => sum + post.love + post.pass, 0),
    [quickVotes],
  );

  const handleVote = (id: number, voteType: VoteType) => {
    setQuickVotes((current) =>
      current.map((post) => {
        if (post.id !== id) {
          return post;
        }

        const currentSelection = post.selectedVote ?? null;

        if (currentSelection === voteType) {
          return post;
        }

        const nextLove = currentSelection === 'love' ? post.love - 1 : post.love;
        const nextPass = currentSelection === 'pass' ? post.pass - 1 : post.pass;

        return {
          ...post,
          love: voteType === 'love' ? nextLove + 1 : nextLove,
          pass: voteType === 'pass' ? nextPass + 1 : nextPass,
          selectedVote: voteType,
        };
      }),
    );
  };

  const handleUploadPhoto = () => {
    const nextPhoto = photoOptions[Math.floor(Math.random() * photoOptions.length)];
    setPhotoUrl(nextPhoto);
    Alert.alert('Photo added', 'Your outfit shot is ready to post.');
  };

  const handleThreadPhotoUpload = () => {
    const nextPhoto = photoOptions[Math.floor(Math.random() * photoOptions.length)];
    setThreadPhotoUrl(nextPhoto);
    Alert.alert('Thread photo added', 'Your styling photo is ready for discussion.');
  };

  const handleQuickSubmit = () => {
    const blocked = checkModeration(draftQuick);

    if (!draftQuick.trim()) {
      Alert.alert('Write a caption', 'Add a short outfit description to post your look.');
      return;
    }

    if (blocked) {
      Alert.alert('Content not approved', blocked);
      return;
    }

    const nextPost: QuickVote = {
      id: Date.now(),
      user: displayName || username,
      caption: draftQuick.trim(),
      vibe: 'your latest look',
      palette: ['#d0b5a1', '#f5ede8'],
      emoji: '✨',
      love: 1,
      pass: 0,
      photo: photoUrl,
    };

    setQuickVotes((current) => [nextPost, ...current]);
    setDraftQuick('');
    setPhotoUrl(photoOptions[0]);
    setActiveTab('quick');
  };

  const handleDiscussionSubmit = () => {
    const blocked = checkModeration(draftDiscussion);

    if (!draftDiscussion.trim()) {
      Alert.alert('Need a thread', 'Write a quick outfit question or opinion to start the conversation.');
      return;
    }

    if (blocked) {
      Alert.alert('Content not approved', blocked);
      return;
    }

    const nextPost: DiscussionPost = {
      id: Date.now(),
      user: displayName || username,
      title: 'Fresh fit check',
      description: draftDiscussion.trim(),
      mood: 'community thread',
      comments: [{ author: 'Style Bot', text: 'Nice. This is a strong look for the feed.' }],
      photo: threadPhotoUrl,
    };

    setDiscussionPosts((current) => [nextPost, ...current]);
    setDraftDiscussion('');
    setThreadPhotoUrl(photoOptions[1]);
    setActiveTab('thread');
  };

  const handleAddComment = (postId: number) => {
    const draft = (discussionCommentDraft[postId] || '').trim();

    if (!draft) {
      Alert.alert('Add a comment', 'Write a quick response before posting.');
      return;
    }

    const blocked = checkModeration(draft);

    if (blocked) {
      Alert.alert('Comment blocked', blocked);
      return;
    }

    setDiscussionPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, { author: displayName || username, text: draft }],
            }
          : post,
      ),
    );

    setDiscussionCommentDraft((current) => ({ ...current, [postId]: '' }));
  };

  const handleCreateAccount = async () => {
    const trimmedEmail = emailInput.trim();
    const trimmedUsername = usernameInput.trim();
    const trimmedPassword = passwordInput.trim();

    if (!trimmedEmail || !trimmedUsername || !trimmedPassword) {
      Alert.alert('Complete profile setup', 'Add your email, username, and password to create your profile.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Valid email required', 'Please add a valid email address.');
      return;
    }

    if (isSupabaseConfigured) {
      const result = await signUpWithEmail(trimmedEmail, trimmedPassword, trimmedUsername);

      if (result.error) {
        Alert.alert('Account setup failed', result.error.message);
        return;
      }
    }

    setEmail(trimmedEmail);
    setUsername(trimmedUsername.toLowerCase().replace(/\s+/g, '.'));
    setDisplayName(trimmedUsername);
    setPassword(trimmedPassword);
    setAccountCreated(true);
    setIsLoginMode(false);
    setEmailInput('');
    setPasswordInput('');
    setUsernameInput('');
    Alert.alert('Account ready', 'Your Mi Moda profile is live.');
  };

  const handleLogin = async () => {
    const trimmedEmail = emailInput.trim();
    const trimmedPassword = passwordInput.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Sign in required', 'Enter both email and password to continue.');
      return;
    }

    if (isSupabaseConfigured) {
      const result = await signInWithEmail(trimmedEmail, trimmedPassword);

      if (result.error) {
        Alert.alert('Unable to sign in', result.error.message);
        return;
      }

      const usernameFromProfile = (result.user as { user_metadata?: { username?: string } } | null)?.user_metadata?.username ?? username;

      setEmail(trimmedEmail);
      setUsername(usernameFromProfile);
      setDisplayName(usernameFromProfile);
      setPassword(trimmedPassword);
      setAccountCreated(true);
      setIsLoginMode(false);
      setEmailInput('');
      setPasswordInput('');
      setUsernameInput('');
      Alert.alert('Welcome back', 'You are signed in to Mi Moda.');
      return;
    }

    if (trimmedEmail !== email || trimmedPassword !== password) {
      Alert.alert('Unable to sign in', 'Check your email and password, or create a profile first.');
      return;
    }

    setAccountCreated(true);
    setIsLoginMode(false);
    setEmailInput('');
    setPasswordInput('');
    setUsernameInput('');
    Alert.alert('Welcome back', 'You are signed in to Mi Moda.');
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await signOutFromMiModa();
    }

    setAccountCreated(false);
    setIsLoginMode(true);
    setEmailInput(email);
    setPasswordInput(password);
    Alert.alert('Signed out', 'You have been logged out of your Mi Moda account.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.appShell}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>fashion social</Text>
            <Text style={styles.brand}>MI MODA</Text>
          </View>
          <Pressable style={styles.alertPill}>
            <Text style={styles.alertPillText}>+24</Text>
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {tabLabels.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'quick' && (
            <>
              <View style={styles.categoryRow}>
                {['Work', 'Wedding', 'Date Night', 'Weekend', 'Travel', 'Street'].map((category, index) => (
                  <Pressable
                    key={category}
                    style={[styles.categoryPill, index === 0 && styles.categoryPillActive]}
                  >
                    <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{category}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.composerCard}>
                <View style={styles.composerHeaderRow}>
                  <Text style={styles.sectionTitle}>Share your look</Text>
                  <Pressable style={styles.uploadMiniButton} onPress={handleUploadPhoto}>
                    <Text style={styles.uploadMiniText}>Add photo</Text>
                  </Pressable>
                </View>

                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={styles.photoPreview} resizeMode="cover" />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>No photo yet</Text>
                  </View>
                )}

                <TextInput
                  value={draftQuick}
                  onChangeText={setDraftQuick}
                  placeholder="Short outfit description..."
                  multiline
                  style={styles.textInput}
                  placeholderTextColor="#8a7a6d"
                />
                <Pressable style={styles.primaryButton} onPress={handleQuickSubmit}>
                  <Text style={styles.primaryButtonText}>Post for quick vote</Text>
                </Pressable>
              </View>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Quick opinions</Text>
                <Text style={styles.mutedText}>live</Text>
              </View>

              {quickVotes.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postMetaRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{post.user.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{post.user}</Text>
                      <Text style={styles.moodText}>{post.vibe}</Text>
                    </View>
                  </View>

                  <View style={styles.cardArt}>
                    {post.photo ? (
                      <Image source={{ uri: post.photo }} style={styles.cardImage} resizeMode="cover" />
                    ) : (
                      <>
                        <View style={[styles.artGlow, { backgroundColor: post.palette[0] }]} />
                        <Text style={styles.outfitEmoji}>{post.emoji}</Text>
                      </>
                    )}
                  </View>

                  <Text style={styles.caption}>{post.caption}</Text>

                  <View style={styles.voteRow}>
                    <Pressable
                      style={[
                        styles.voteButton,
                        styles.voteLove,
                        post.selectedVote === 'love' && styles.voteLoveSelected,
                      ]}
                      onPress={() => handleVote(post.id, 'love')}
                    >
                      <Text style={[styles.voteText, post.selectedVote === 'love' && styles.voteTextSelected]}>Love {post.love}</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.voteButton,
                        styles.votePass,
                        post.selectedVote === 'pass' && styles.votePassSelected,
                      ]}
                      onPress={() => handleVote(post.id, 'pass')}
                    >
                      <Text style={[styles.voteText, post.selectedVote === 'pass' && styles.voteTextSelected]}>Pass {post.pass}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </>
          )}

          {activeTab === 'thread' && (
            <>
              <View style={styles.composerCard}>
                <View style={styles.composerHeaderRow}>
                  <Text style={styles.sectionTitle}>Start a style thread</Text>
                  <Pressable style={styles.uploadMiniButton} onPress={handleThreadPhotoUpload}>
                    <Text style={styles.uploadMiniText}>Add photo</Text>
                  </Pressable>
                </View>

                {threadPhotoUrl ? (
                  <Image source={{ uri: threadPhotoUrl }} style={styles.photoPreview} resizeMode="cover" />
                ) : null}

                <TextInput
                  value={draftDiscussion}
                  onChangeText={setDraftDiscussion}
                  placeholder="Ask for outfit advice or share a styling thought..."
                  multiline
                  style={styles.textInput}
                  placeholderTextColor="#8a7a6d"
                />
                <Pressable style={styles.primaryButton} onPress={handleDiscussionSubmit}>
                  <Text style={styles.primaryButtonText}>Publish thread</Text>
                </Pressable>
              </View>

              {discussionPosts.map((post) => (
                <View key={post.id} style={styles.discussionCard}>
                  <Text style={styles.threadLabel}>{post.mood}</Text>
                  <Text style={styles.threadTitle}>{post.title}</Text>
                  <Text style={styles.discussionText}>{post.description}</Text>

                  {post.photo ? (
                    <Image source={{ uri: post.photo }} style={styles.threadImage} resizeMode="cover" />
                  ) : null}

                  <View style={styles.commentList}>
                    {post.comments.map((comment, index) => (
                      <View key={`${post.id}-${index}`} style={styles.commentBubble}>
                        <Text style={styles.commentAuthor}>{comment.author}</Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.commentComposer}>
                    <TextInput
                      value={discussionCommentDraft[post.id] || ''}
                      onChangeText={(text) =>
                        setDiscussionCommentDraft((current) => ({ ...current, [post.id]: text }))
                      }
                      placeholder="Add a comment..."
                      style={styles.commentInput}
                      placeholderTextColor="#8a7a6d"
                    />
                    <Pressable style={styles.commentButton} onPress={() => handleAddComment(post.id)}>
                      <Text style={styles.commentButtonText}>Reply</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <View style={styles.profileCard}>
                <View style={styles.profileHeaderRow}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.profileName}>{displayName}</Text>
                    <Text style={styles.profileHandle}>@{username}</Text>
                  </View>
                </View>

                <View style={styles.profileStatsRow}>
                  <View style={styles.profileStatBox}>
                    <Text style={styles.profileStatNumber}>142</Text>
                    <Text style={styles.profileStatLabel}>likes</Text>
                  </View>
                  <View style={styles.profileStatBox}>
                    <Text style={styles.profileStatNumber}>28</Text>
                    <Text style={styles.profileStatLabel}>threads</Text>
                  </View>
                  <View style={styles.profileStatBox}>
                    <Text style={styles.profileStatNumber}>9</Text>
                    <Text style={styles.profileStatLabel}>replies</Text>
                  </View>
                </View>
              </View>

              {!accountCreated && (
                <View style={styles.composerCard}>
                  <View style={styles.authToggleRow}>
                    <Pressable
                      style={[styles.authToggleButton, !isLoginMode && styles.authToggleButtonActive]}
                      onPress={() => setIsLoginMode(false)}
                    >
                      <Text style={[styles.authToggleText, !isLoginMode && styles.authToggleTextActive]}>Create</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.authToggleButton, isLoginMode && styles.authToggleButtonActive]}
                      onPress={() => setIsLoginMode(true)}
                    >
                      <Text style={[styles.authToggleText, isLoginMode && styles.authToggleTextActive]}>Log in</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.sectionTitle}>{isLoginMode ? 'Welcome back' : 'Create account'}</Text>
                  <TextInput
                    value={emailInput}
                    onChangeText={setEmailInput}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.textInput}
                    placeholderTextColor="#8a7a6d"
                  />

                  {!isLoginMode && (
                    <TextInput
                      value={usernameInput}
                      onChangeText={setUsernameInput}
                      placeholder="Username"
                      autoCapitalize="none"
                      style={styles.textInput}
                      placeholderTextColor="#8a7a6d"
                    />
                  )}

                  <TextInput
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    placeholder="Password"
                    secureTextEntry
                    style={styles.textInput}
                    placeholderTextColor="#8a7a6d"
                  />
                  <Pressable style={styles.primaryButton} onPress={isLoginMode ? handleLogin : handleCreateAccount}>
                    <Text style={styles.primaryButtonText}>{isLoginMode ? 'Log in' : 'Create profile'}</Text>
                  </Pressable>
                </View>
              )}

              {accountCreated && (
                <View style={styles.profileCard}>
                  <View style={styles.profileHeaderRow}>
                    <View style={styles.profileAvatar}>
                      <Text style={styles.profileAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.profileName}>{displayName}</Text>
                      <Text style={styles.profileHandle}>@{username}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Username</Text>
                    <Text style={styles.detailValue}>@{username}</Text>
                  </View>
                  <Pressable style={styles.secondaryButton} onPress={handleSignOut}>
                    <Text style={styles.secondaryButtonText}>Sign out</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4eee8',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#f4eee8',
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#7a645a',
    marginBottom: 4,
  },
  brand: {
    fontSize: 30,
    letterSpacing: 3,
    fontWeight: '800',
    color: '#201916',
    textTransform: 'uppercase',
  },
  alertPill: {
    backgroundColor: '#201916',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 54,
    alignItems: 'center',
  },
  alertPillText: {
    color: '#f7efe9',
    fontWeight: '700',
    fontSize: 13,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#efe1d1',
    borderRadius: 18,
    padding: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e3d0ba',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#201916',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  tabText: {
    color: '#4b3a33',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fffaf5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#f4e7dc',
    borderWidth: 1,
    borderColor: '#ebd7c7',
  },
  categoryPillActive: {
    backgroundColor: '#201916',
    borderColor: '#201916',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3a2e2a',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  categoryTextActive: {
    color: '#fffaf5',
  },
  composerCard: {
    backgroundColor: '#fbf6f1',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eadbc9',
    marginBottom: 20,
  },
  composerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadMiniButton: {
    backgroundColor: '#f1dec9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  uploadMiniText: {
    color: '#201916',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#efe0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPlaceholderText: {
    color: '#6d574d',
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1a120f',
    fontWeight: '700',
  },
  mutedText: {
    color: '#7b665d',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#f3e8df',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1d1714',
    fontSize: 15,
    minHeight: 82,
    textAlignVertical: 'top',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e1c8b1',
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: '#201916',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fffaf5',
    fontWeight: '700',
    fontSize: 14,
  },
  postCard: {
    backgroundColor: '#fffaf7',
    borderRadius: 24,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e9d8c6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5d0be',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: '700',
    color: '#201916',
  },
  userName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1d1714',
  },
  moodText: {
    marginTop: 2,
    color: '#7a645a',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e7d0bb',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  artGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -40,
    right: -20,
    opacity: 0.4,
  },
  outfitEmoji: {
    fontSize: 72,
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 40,
  },
  caption: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1d1714',
    marginBottom: 12,
  },
  voteRow: {
    flexDirection: 'row',
    gap: 10,
  },
  voteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 52,
    opacity: 0.88,
  },
  voteLove: {
    backgroundColor: '#f7dfe7',
    borderColor: '#f4bfd0',
  },
  votePass: {
    backgroundColor: '#dfeafc',
    borderColor: '#bfd5f7',
  },
  voteLoveSelected: {
    backgroundColor: '#f7a7c2',
    borderColor: '#f25d9d',
    opacity: 1,
    transform: [{ scale: 1.02 }],
    shadowColor: '#f25d9d',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  votePassSelected: {
    backgroundColor: '#7bb3ff',
    borderColor: '#3d7ef5',
    opacity: 1,
    transform: [{ scale: 1.02 }],
    shadowColor: '#3d7ef5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  voteText: {
    color: '#201916',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  voteTextSelected: {
    color: '#201916',
  },
  discussionCard: {
    backgroundColor: '#fffaf7',
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e7d7c7',
  },
  threadImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    marginBottom: 12,
  },
  threadLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#7b665d',
    marginBottom: 6,
  },
  threadTitle: {
    fontSize: 20,
    color: '#1b1512',
    fontWeight: '700',
    marginBottom: 8,
  },
  discussionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#352b27',
    marginBottom: 12,
  },
  commentList: {
    gap: 8,
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f3e8df',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1d1714',
    borderWidth: 1,
    borderColor: '#e1c8b1',
  },
  commentButton: {
    backgroundColor: '#201916',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  commentButtonText: {
    color: '#fffaf5',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  commentBubble: {
    backgroundColor: '#f8efe8',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8d6c7',
  },
  commentAuthor: {
    fontWeight: '700',
    color: '#1a120f',
    marginBottom: 4,
  },
  commentText: {
    color: '#41332f',
    fontSize: 14,
    lineHeight: 20,
  },
  authToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f2e5d8',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e3cbb0',
  },
  authToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  authToggleButtonActive: {
    backgroundColor: '#201916',
  },
  authToggleText: {
    color: '#5b453f',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  authToggleTextActive: {
    color: '#fffaf5',
  },
  secondaryButton: {
    marginTop: 18,
    backgroundColor: '#efe2d5',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dfc6a6',
  },
  secondaryButtonText: {
    color: '#201916',
    fontWeight: '700',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#fffaf7',
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#eadcc7',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#efe0d2',
  },
  detailLabel: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7a645a',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b1512',
    maxWidth: '60%',
    textAlign: 'right',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#d9b89b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#201916',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b1311',
  },
  profileHandle: {
    color: '#7c655d',
    marginTop: 2,
    fontSize: 13,
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  profileStatBox: {
    flex: 1,
    backgroundColor: '#f6efe8',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5d3c1',
  },
  profileStatNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e1714',
  },
  profileStatLabel: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7a645a',
  },
  inboxCard: {
    backgroundColor: '#fffaf7',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6d6c8',
  },
  inboxFrom: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1b1512',
    marginBottom: 6,
  },
  inboxText: {
    color: '#41332f',
    lineHeight: 20,
    fontSize: 14,
  },
  inboxTime: {
    marginTop: 8,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7b665d',
  },
});
