import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      refreshToken
      user {
        id
        email
        fullName
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $fullName: String!) {
    register(input: { email: $email, password: $password, fullName: $fullName }) {
      accessToken
      refreshToken
      user {
        id
        email
        fullName
        role
      }
    }
  }
`;

export const GET_LANDING_DATA = gql`
  query GetLandingData {
    landing {
      events {
        id
        title
        description
        date
        price
        imageUrl
        venue {
          name
        }
      }
      dJs {
        id
        name
        stageName
        bio
        profilePictureUrl
      }
    }
  }
`;

export const GET_DJS = gql`
  query GetDJs {
    dJs {
      id
      name
      stageName
      bio
      genre
      profilePictureUrl
      coverImageUrl
      tagline
      followerCount
    }
  }
`;

export const GET_DJ_BY_ID = gql`
  query GetDjById($id: UUID!) {
    dj(id: $id) {
      id
      name
      stageName
      bio
      longBio
      genre
      profilePictureUrl
      coverImageUrl
      tagline
      specialties
      achievements
      yearsExperience
      influencedBy
      equipmentUsed
      topTracks
      followerCount
      upcomingEvents {
        eventId
        title
        date
        venueName
        city
        price
        imageUrl
      }
      socialLinks {
        label
        url
      }
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      date
      price
      imageUrl
      genres
      venue {
        id
        name
        city
      }
    }
  }
`;

export const GET_EVENT_BY_ID = gql`
  query GetEventById($id: UUID!) {
    event(id: $id) {
      id
      title
      description
      date
      price
      imageUrl
      videoUrl
      venue {
        id
        name
        description
        address
        city
        country
      }
    }
  }
`;

export const GET_GENRES = gql`
  query GetGenres {
    genres {
      id
      name
    }
  }
`;

export const GET_VENUES = gql`
  query GetVenues {
    venues {
      id
      name
      city
      country
    }
  }
`;

export const GET_FOLLOWED_DJS = gql`
  query GetFollowedDJs($userId: String!) {
    followedDjs(userId: $userId) {
      id
      name
      stageName
      bio
      genre
      profilePictureUrl
      followerCount
    }
  }
`;

export const IS_FOLLOWING_DJ = gql`
  query IsFollowingDj($userId: String!, $djId: UUID!) {
    isFollowingDj(userId: $userId, djId: $djId)
  }
`;

export const FOLLOW_DJ = gql`
  mutation FollowDj($input: FollowDjInput!) {
    followDj(input: $input)
  }
`;

export const UNFOLLOW_DJ = gql`
  mutation UnfollowDj($input: FollowDjInput!) {
    unfollowDj(input: $input)
  }
`;

export const SUBSCRIBE_NEWSLETTER = gql`
  mutation SubscribeNewsletter($email: String!, $userId: String!) {
    subscribeNewsletter(input: { email: $email, userId: $userId }) {
      id
      email
      subscribedAt
    }
  }
`;

// Temporary alias until dedicated push subscription mutations exist.
export const SUBSCRIBE_TO_PUSH = SUBSCRIBE_NEWSLETTER;

export const GET_USER_TICKETS = gql`
  query GetUserTickets($userId: String!) {
    ticketsByUser(userId: $userId) {
      id
      ticketNumber
      eventId
      price
      purchaseDate
      isValid
      isCheckedIn
      event {
        id
        title
        date
        venueName
        city
        imageUrl
      }
    }
  }
`;

export const PURCHASE_TICKET = gql`
  mutation PurchaseTicket($input: PurchaseTicketInput!) {
    purchaseTicket(input: $input) {
      id
      ticketNumber
      price
      purchaseDate
      event {
        id
        title
        date
      }
    }
  }
`;
