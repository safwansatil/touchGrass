import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export async function getRecommendedUsers(req, res) {
    try {
        // Always fetch the latest user from DB to get up-to-date friends
        const currentUser = await User.findById(req.user._id).select('friends');
        const currentUserId = req.user._id;
        const friendsArray = Array.isArray(currentUser.friends) ? currentUser.friends : [];

        const recommendedUsers = await User.find({
            _id: { $ne: currentUserId, $nin: friendsArray },
            isOnBoarded: true
        }).select('fullName profilePic nativeLanguage learningLanguage bio location');

        console.log(`Found ${recommendedUsers.length} recommended users for user ${currentUserId}`);
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error in getRecommendedUsers controller. ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user._id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends Controller. ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user._id;
        const { id: recipientId } = req.params;
        if (myId === recipientId) {
            return res.status(400).json({ message: "You can't send a friend request to Yourself!!" });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "No such User Found" });
        }

        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You're already friends!" });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ],
        });
        if (existingRequest) {
            return res.status(400).json({ message: "A friend request already exists between you and this user" });
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        });

        console.log(`Friend request created: ${friendRequest._id} from ${myId} to ${recipientId}`);
        res.status(201).json(friendRequest);
        // 201 - a new resource has been created

    } catch (error) {
        console.error("Error in sendFriendRequest controller. ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;
        console.log(`Request params:`, req.params);
        console.log(`Request ID from params:`, requestId);
        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend Request not found" });
        }

        console.log(`Accepting friend request: ${requestId}`);
        console.log(`Friend request object:`, friendRequest);
        console.log(`Friend request recipient: ${friendRequest.recipient.toString()}`);
        console.log(`Current user ID: ${req.user._id.toString()}`);

        // Compare ObjectIds properly
        if (!friendRequest.recipient.equals(req.user._id)) {
            return res.status(403).json({ message: "You are unauthorized to accept this request" });
        }

        friendRequest.status = "accepted";

        await friendRequest.save();

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        });
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });
        // $addToSet only adds the element in the array if it doesnt exist already

        res.status(200).json({ message: "Friend Request Accepted" });

    } catch (error) {
        console.log("Error in acceptFriendRequest controller. ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user._id,
            status: "pending"
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedReqs = await FriendRequest.find({
            sender: req.user._id,
            status: "accepted"
        }).populate("recipient", "fullName profilePic");

        console.log(`Found ${incomingReqs.length} incoming requests and ${acceptedReqs.length} accepted requests for user ${req.user._id}`);
        res.status(200).json({ incomingReqs, acceptedReqs });
    } catch (error) {
        console.log("Error in getFriendRequests Controller. ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user._id,
            status: "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log("Error in getOutgoingFriendRequests Controller. ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}