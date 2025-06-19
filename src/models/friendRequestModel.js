import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class FriendRequest extends Model {
    static associate(models) {
        FriendRequest.belongsTo(models.User, {
            foreignKey: 'request_sender_id',
            as: 'Sender'
        });
        FriendRequest.belongsTo(models.User, {
            foreignKey: 'request_receiver_id',
            as: 'Receiver'
        });
        FriendRequest.belongsTo(models.ChatRoom, {
            foreignKey: 'room_id',
            as: 'ChatRoom'
        });
    }
}

FriendRequest.init(
    {
        friend_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        request_sender_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        request_receiver_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        room_id: {
            type: DataTypes.INTEGER,
            defaultValue: null,
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue:1,
            comment: '1=pending, 2=accepted, 3=rejected',
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
        }
    },
    {
        sequelize,
        tableName: 'friend_requests',
        timestamps: false,
    }
);

export { FriendRequest };
