import React from 'react';
import { useNavigation } from '@react-navigation/native';
import VideoPost from '../components/VideoPost';

export default function ForYouScreen() {
  const navigation = useNavigation();

  return (
    <VideoPost
      source={require('../../assets/foryou.jpg')}
      username="craig_love"
      caption={'The most satisfying Job #fyp #satisfying #roadmarking'}
      song="Roddy Roundicch - The Rou"
      avatar="https://i.pravatar.cc/150?img=33"
      initialLikes={328700}
      commentCount="578"
      canFollow
      onCommentPress={() =>
        navigation.navigate('Inbox', { video: 'foryou' })
      }
    />
  );
}
