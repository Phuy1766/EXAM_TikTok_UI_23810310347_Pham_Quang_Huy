import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COMMENTS } from '../data/comments';

const BACKGROUNDS = {
  following: require('../../assets/following.jpg'),
  foryou: require('../../assets/foryou.jpg'),
};

function formatLikes(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function LikeButton({ liked, count, onPress }) {
  return (
    <TouchableOpacity
      style={styles.likeCol}
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={20}
        color={liked ? '#FF3B5C' : '#8e8e93'}
      />
      <Text style={[styles.likeCount, liked && { color: '#FF3B5C' }]}>
        {formatLikes(count)}
      </Text>
    </TouchableOpacity>
  );
}

function ReplyItem({ reply, onToggleLike, onReply }) {
  return (
    <View style={styles.replyRow}>
      <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
      <View style={styles.replyBody}>
        <Text style={styles.commentName}>{reply.username}</Text>
        <Text style={styles.commentText}>{reply.text}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{reply.time}</Text>
          <TouchableOpacity onPress={() => onReply(reply)}>
            <Text style={styles.replyBtn}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <LikeButton
        liked={reply.likedByMe}
        count={reply.likes}
        onPress={() => onToggleLike(reply.id)}
      />
    </View>
  );
}

function CommentItem({
  item,
  expanded,
  onToggleLike,
  onToggleExpand,
  onReply,
  onToggleReplyLike,
}) {
  const replyCount = item.replies?.length || 0;
  return (
    <View>
      <View style={styles.commentRow}>
        <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
        <View style={styles.commentBody}>
          <View style={styles.nameRow}>
            <Text style={styles.commentName}>{item.username}</Text>
            {item.verified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color="#20D5EC"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.time}</Text>
            <TouchableOpacity onPress={() => onReply(item)}>
              <Text style={styles.replyBtn}>Reply</Text>
            </TouchableOpacity>
          </View>
          {replyCount > 0 && (
            <TouchableOpacity
              style={styles.repliesBtn}
              onPress={() => onToggleExpand(item.id)}
            >
              <View style={styles.repliesLine} />
              <Text style={styles.repliesText}>
                {expanded
                  ? `Hide replies`
                  : `View replies (${replyCount})`}
              </Text>
              <Feather
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#8e8e93"
              />
            </TouchableOpacity>
          )}
        </View>
        <LikeButton
          liked={item.likedByMe}
          count={item.likes}
          onPress={() => onToggleLike(item.id)}
        />
      </View>

      {expanded &&
        item.replies.map((r) => (
          <ReplyItem
            key={r.id}
            reply={r}
            onToggleLike={(rid) => onToggleReplyLike(item.id, rid)}
            onReply={(target) =>
              onReply({ ...target, _parentId: item.id })
            }
          />
        ))}
    </View>
  );
}

function prepareComments() {
  return COMMENTS.map((c) => ({
    ...c,
    likedByMe: false,
    replies: (c.replies || []).map((r) => ({ ...r, likedByMe: false })),
  }));
}

export default function CommentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const videoKey = route.params?.video || 'foryou';
  const bgSource = BACKGROUNDS[videoKey] || BACKGROUNDS.foryou;

  const inputRef = useRef(null);
  const [comments, setComments] = useState(prepareComments);
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { username, _parentId? }
  const [expanded, setExpanded] = useState({}); // {commentId: true}

  const total = useMemo(() => {
    const extras = comments.reduce(
      (acc, c) => acc + (c.replies?.length || 0),
      0
    );
    return comments.length + extras;
  }, [comments]);

  const toggleLike = (id) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              likedByMe: !c.likedByMe,
              likes: c.likes + (c.likedByMe ? -1 : 1),
            }
          : c
      )
    );
  };

  const toggleReplyLike = (parentId, replyId) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r.id === replyId
                  ? {
                      ...r,
                      likedByMe: !r.likedByMe,
                      likes: r.likes + (r.likedByMe ? -1 : 1),
                    }
                  : r
              ),
            }
          : c
      )
    );
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleReply = (target) => {
    // target may be a top-level comment (use its id as parent)
    // or a reply with _parentId set
    const parentId = target._parentId || target.id;
    setReplyingTo({ username: target.username, parentId });
    setExpanded((prev) => ({ ...prev, [parentId]: true }));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelReply = () => setReplyingTo(null);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;

    if (replyingTo) {
      const newReply = {
        id: String(Date.now()),
        username: 'you',
        avatar: 'https://i.pravatar.cc/150?img=5',
        text,
        time: 'now',
        likes: 0,
        likedByMe: false,
      };
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.parentId
            ? { ...c, replies: [...c.replies, newReply] }
            : c
        )
      );
      setReplyingTo(null);
    } else {
      const newComment = {
        id: String(Date.now()),
        username: 'you',
        avatar: 'https://i.pravatar.cc/150?img=5',
        text,
        time: 'now',
        likes: 0,
        replies: [],
        verified: false,
        likedByMe: false,
      };
      setComments((prev) => [newComment, ...prev]);
    }
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background video preview */}
      <ImageBackground
        source={bgSource}
        style={styles.videoPreview}
        resizeMode="cover"
      >
        <View style={[styles.topTabs, { marginTop: insets.top + 8 }]}>
          <Text
            style={
              videoKey === 'following' ? styles.topTabActive : styles.topTabInactive
            }
          >
            Following
          </Text>
          <Text style={styles.topDivider}>|</Text>
          <Text
            style={
              videoKey === 'foryou' ? styles.topTabActive : styles.topTabInactive
            }
          >
            For You
          </Text>
        </View>
      </ImageBackground>

      {/* Comments sheet */}
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View style={{ width: 24 }} />
          <Text style={styles.sheetTitle}>{total} comments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <CommentItem
              item={item}
              expanded={!!expanded[item.id]}
              onToggleLike={toggleLike}
              onToggleExpand={toggleExpand}
              onReply={handleReply}
              onToggleReplyLike={toggleReplyLike}
            />
          )}
          contentContainerStyle={{ paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Replying-to banner */}
        {replyingTo && (
          <View style={styles.replyingBar}>
            <Text style={styles.replyingText}>
              Replying to{' '}
              <Text style={{ fontWeight: '700' }}>@{replyingTo.username}</Text>
            </Text>
            <TouchableOpacity onPress={cancelReply} hitSlop={8}>
              <Ionicons name="close" size={18} color="#8e8e93" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.inputField}>
            <TextInput
              ref={inputRef}
              placeholder={
                replyingTo ? `Reply to @${replyingTo.username}...` : 'Add comment...'
              }
              placeholderTextColor="#8e8e93"
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={submit}
              returnKeyType="send"
            />
          </View>
          {draft.trim().length > 0 ? (
            <TouchableOpacity style={styles.sendBtn} onPress={submit}>
              <Text style={styles.sendText}>Post</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.inputIcon}>
                <Ionicons name="at" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputIcon}>
                <Ionicons name="happy-outline" size={24} color="#000" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  videoPreview: {
    flex: 3,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  topTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTabInactive: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 17,
    fontWeight: '600',
  },
  topTabActive: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  topDivider: {
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 10,
    fontSize: 17,
  },
  sheet: {
    flex: 7,
    backgroundColor: '#F1F1F2',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingTop: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  commentBody: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentName: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '500',
  },
  commentText: {
    color: '#000',
    fontSize: 15,
    marginTop: 2,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    color: '#8e8e93',
    fontSize: 13,
    marginRight: 18,
  },
  replyBtn: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '600',
  },
  repliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  repliesLine: {
    width: 22,
    height: 1,
    backgroundColor: '#C7C7CC',
    marginRight: 8,
  },
  repliesText: {
    color: '#8e8e93',
    fontSize: 13,
    marginRight: 4,
  },
  replyRow: {
    flexDirection: 'row',
    paddingLeft: 64,
    paddingRight: 14,
    paddingVertical: 8,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
  },
  replyBody: {
    flex: 1,
    marginLeft: 10,
  },
  likeCol: {
    alignItems: 'center',
    marginLeft: 8,
    width: 40,
    paddingTop: 2,
  },
  likeCount: {
    color: '#8e8e93',
    fontSize: 12,
    marginTop: 2,
  },
  replyingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E5E5EA',
  },
  replyingText: {
    color: '#3c3c43',
    fontSize: 13,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D1D6',
    backgroundColor: '#F1F1F2',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    fontSize: 15,
    color: '#000',
    padding: 0,
  },
  inputIcon: {
    marginLeft: 14,
  },
  sendBtn: {
    marginLeft: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FF3B5C',
    borderRadius: 6,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
