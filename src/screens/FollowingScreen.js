import React from 'react';
import { useNavigation } from '@react-navigation/native';
import VideoPost from '../components/VideoPost';

export default function FollowingScreen() {
  const navigation = useNavigation();

  return (
    <VideoPost
      source={require('../../assets/following.jpg')}
      username="karennne"
      date="1-28"
      caption="#avicii #wflove"
      song="Avicii - Waiting For Love (ft."
      avatar="https://i.pravatar.cc/150?img=45"
      initialLikes={4445}
      commentCount="64"
      onCommentPress={() =>
        navigation.navigate('Inbox', { video: 'following' })
      }
    />
  );
}
