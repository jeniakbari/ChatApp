import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class User extends Model {
    static associate(models) {
        User.hasMany(models.UserLoginLogs, { foreignKey: "user_id" });
        User.hasMany(models.UserOtpLogs, { foreignKey: 'user_id' });
        User.hasMany(models.FriendRequest, { foreignKey: 'request_sender_id', as: 'SentRequests' });
        User.hasMany(models.FriendRequest, { foreignKey: 'request_receiver_id', as: 'ReceivedRequests' });
        // User.hasMany(models.ChatRoom, { foreignKey: 'created_by', as: 'CreatedRooms' });
        User.hasMany(models.ChatMessage, { foreignKey: 'sender_id', as: 'SentMessages' });
        User.hasMany(models.ChatMessage, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
        User.hasMany(models.BlockedUser, { foreignKey: 'user_id', as: 'BlockedUsers' });
        User.hasMany(models.BlockedUser, { foreignKey: 'blocked_user_id', as: 'BlockedByUsers' });   
        User.belongsToMany(models.ChatRoom, {through: models.ChatParticipant,foreignKey: 'user_id',otherKey: 'room_id', as: 'ChatRooms'});     
    }
}

User.init(
    {
        user_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false, 
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: {
                name: 'unique_email',
                msg: 'Email must be unique',
            },
        },
        failed_attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        is_verified: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // 0 for not verified, 1 for verified
        },
        verification_token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_online: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // 0 for offline, 1 for online
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        
    },
    {
        sequelize,
        tableName: "users",
        timestamps: false,
    }
);

export { User };
