import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
Box,
Container,
Typography,
Paper,
Avatar,
Rating,
Grid,
Button,
Dialog,
DialogTitle,
DialogContent,
List,
ListItem,
ListItemText
} from '@mui/material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const PublicProfile = () => {
const location = useLocation();
const { auth } = useContext(AuthContext);
const { userId } = useParams();
const currentUserId = auth?.userId
? Number(auth.userId)
: Number(localStorage.getItem('userId') || 0);

const [user, setUser] = useState(null);
const [items, setItems] = useState([]);
const [reviews, setReviews] = useState([]);
const [loading, setLoading] = useState(true);

const [selectedTab, setSelectedTab] = useState('listed');
const [showReviews, setShowReviews] = useState(false);

const [isFollowing, setIsFollowing] = useState(false);
const [error, setError] = useState('');

const [followers, setFollowers] = useState([]);
const [following, setFollowing] = useState([]);
const [showFollowersDialog, setShowFollowersDialog] = useState(false);
const [showFollowingDialog, setShowFollowingDialog] = useState(false);
const [favorites, setFavorites] = useState([]);

// fetch the user data, items, reviews
const fetchData = async () => {
try {
const userRes = await axios.get(`http://localhost:8080/api/users/${userId}`);
const itemsRes = await axios.get(`http://localhost:8080/api/items?userId=${userId}`);
const reviewsRes = await axios.get(`http://localhost:8080/api/reviews/items-by-user/${userId}`);

setUser(userRes.data);
setItems(itemsRes.data);
setReviews(reviewsRes.data);
setLoading(false);
} catch (err) {
console.error('Error fetching data:', err);
setError("Charities don't access to public profiles.");
setLoading(false);
}
};

// Fetch the followers & following
const fetchFollowersFollowing = async () => {
try {
const [followersRes, followingRes] = await Promise.all([
axios.get(`http://localhost:8080/api/users/${userId}/followers`),
axios.get(`http://localhost:8080/api/users/${userId}/following`)
]);
setFollowers(followersRes.data);
setFollowing(followingRes.data);
} catch (err) {
console.error('Error fetching followers/following:', err);
}
};



const getFavoriteItems = async () => {
try {
const response = await axios.get(`http://localhost:8080/api/users/${userId}/favourites`, {
headers: {
Authorization: `Bearer ${localStorage.getItem('authToken')}`,
},
});
console.log('Favorites response:', response.data); // Debugging
setFavorites(response.data);
} catch (error) {
console.error('Error fetching favorites:', error);
setError('Could not load favorites.');
}
};

useEffect(() => {
fetchData();
}, [userId]);

useEffect(() => {
fetchFollowersFollowing();
}, [userId]);

useEffect(() => {
if (selectedTab === 'favorites') {
getFavoriteItems();
}
}, [selectedTab, userId]);

// make sure to check if current user is following
useEffect(() => {
if (!currentUserId || currentUserId === Number(userId)) return;
const checkFollowing = async () => {
try {
const res = await axios.get(`http://localhost:8080/api/follows/my-following/${currentUserId}`);
const followedList = res.data;
const amIFollowing = followedList.some(u => Number(u.id) === Number(userId));
setIsFollowing(amIFollowing);
} catch (e) {
console.error('Error checking follow status:', e);
}
};
checkFollowing();
}, [userId, currentUserId, auth]);

const handleFollow = async () => {
try {
await axios.post(
`http://localhost:8080/api/follows/${userId}`,
{},
{ headers: { 'X-User-Id': currentUserId } }
);
setIsFollowing(true);
// for live up date we Re-fetch so the new follower count updates
fetchFollowersFollowing();
} catch (err) {
console.error('Error following user:', err);
setError('Could not follow user.');
}
};

const handleUnfollow = async () => {
try {
await axios.delete(`http://localhost:8080/api/follows/${userId}`, {
headers: { 'X-User-Id': currentUserId },
});
setIsFollowing(false);
// another live update -> Re-fetch so the new follower count updates
fetchFollowersFollowing();
} catch (err) {
console.error('Error unfollowing user:', err);
setError('Could not unfollow user.');
}
};

if (loading) return <Typography>Loading...</Typography>;
if (error) {
return (
<Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
{error}
</Typography>
);
}
if (!user) {
return <Typography textAlign="center" mt={4}>User not found</Typography>;
}

const averageRating = reviews.length > 0
? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
: 0;

return (
<Container maxWidth="md" sx={{ mt: 4 }}>
<Paper sx={{ p: 3, mb: 4 }}>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
<Avatar src={user.profilePicture} sx={{ width: 100, height: 100 }} />
<div>
<Typography variant="h4">
{user.name} {user.surname}
</Typography>
<Typography variant="subtitle1">{user.address}</Typography>

<Box
sx={{ display: 'flex', alignItems: 'center', mt: 1, cursor: 'pointer' }}
onClick={() => setShowReviews(!showReviews)}
>
<Rating value={averageRating} precision={0.5} readOnly />
<Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
({reviews.length} reviews)
</Typography>
</Box>

{currentUserId && currentUserId !== Number(userId) && (
<Box sx={{ mt: 2 }}>
{isFollowing ? (
<Button variant="outlined" color="primary" onClick={handleUnfollow}>
Unfollow
</Button>
) : (
<Button variant="contained" color="primary" onClick={handleFollow}>
Follow
</Button>
)}
</Box>
)}

<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
<Button variant="outlined" onClick={() => setShowFollowersDialog(true)}>
{followers.length} Followers
</Button>
<Button variant="outlined" onClick={() => setShowFollowingDialog(true)}>
{following.length} Following
</Button>
</Box>
</div>
</Box>
</Paper>

<Dialog open={showFollowersDialog} onClose={() => setShowFollowersDialog(false)}>
<DialogTitle>Followers</DialogTitle>
<DialogContent>
{followers.length === 0 ? (
<Typography>No followers yet</Typography>
) : (
<List>
{followers.map((follower) => (
<ListItem key={follower.id} button>
<Link
to={`/public-profile/${follower.id}`}
style={{ textDecoration: 'none' }}
>
<ListItemText primary={`${follower.name} ${follower.surname}`} />
</Link>
</ListItem>
))}
</List>
)}
</DialogContent>
</Dialog>

<Dialog open={showFollowingDialog} onClose={() => setShowFollowingDialog(false)}>
<DialogTitle>Following</DialogTitle>
<DialogContent>
{following.length === 0 ? (
<Typography>Not following anyone yet</Typography>
) : (
<List>
{following.map((followedUser) => (
<ListItem key={followedUser.id} button>
<Link
to={`/public-profile/${followedUser.id}`}
style={{ textDecoration: 'none' }}
>
<ListItemText primary={`${followedUser.name} ${followedUser.surname}`} />
</Link>
</ListItem>
))}
</List>
)}
</DialogContent>
</Dialog>

<Box className="flex justify-center gap-6 mb-6">
<Button
variant={selectedTab === 'listed' ? 'contained' : 'outlined'}
color="success"
onClick={() => setSelectedTab('listed')}
sx={{ fontWeight: 'bold', width: '150px' }}
>
Listed Items
</Button>
<Button
variant={selectedTab === 'favorites' ? 'contained' : 'outlined'}
color="success"
onClick={() => setSelectedTab('favorites')}
sx={{ fontWeight: 'bold', width: '150px' }}
>
Favorites
</Button>
</Box>

{showReviews && (
<Box sx={{ mt: 4 }}>
<Typography variant="h5" sx={{ mb: 2 }}>Reviews</Typography>
{reviews.map((review, index) => (
<Paper key={index} sx={{ p: 2, mb: 2 }}>
<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
<Rating value={review.rating} readOnly />
<Typography variant="body2" sx={{ ml: 1 }}>
{new Date(review.createdAt).toLocaleDateString()}
</Typography>
</Box>
<Typography>{review.comment}</Typography>
</Paper>
))}
{reviews.length === 0 && (
<Typography align="center" color="gray" py={4}>No reviews yet</Typography>
)}
</Box>
)}

<Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
{selectedTab === 'listed' ? "Listed Items" : "Favorites"}
</Typography>
<Grid container spacing={2}>
{selectedTab === 'listed' && items.map((item) => (
<Grid item xs={12} sm={6} md={4} key={item.id}>
<Paper sx={{ p: 2 }}>
<img
src={item.imageUrl}
alt={item.itemName}
style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
/>
<Typography variant="h6" sx={{ mt: 1 }}>{item.itemName}</Typography>
<Typography variant="body2">{item.description}</Typography>
</Paper>
</Grid>
))}
{selectedTab === 'favorites' && (
favorites.length > 0 ? (
<Grid container spacing={2}>
{favorites.map((item) => (
<Grid item xs={12} sm={6} md={4} key={item.id}>
<Paper sx={{ p: 2 }}>
<img
src={item.imageUrl}
alt={item.itemName}
style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
/>
<Typography variant="h6" sx={{ mt: 1 }}>{item.itemName}</Typography>
<Typography variant="body2">{item.description}</Typography>
</Paper>
</Grid>
))}
</Grid>
) : (
<Typography align="center" color="gray" py={4}>
No favorites yet
</Typography>
)
)}
</Grid>
</Container>
);
};

export default PublicProfile;