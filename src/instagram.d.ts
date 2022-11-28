type jsonStuff = jsonBase | jsonBaseGroup | jsonRegularGroup;

interface jsonBase {
    "participants": { name: string }[];
    "title": "\u00f0\u009d\u009f\u00ac\u00f0\u009d\u009f\u00ae";
    "is_still_participant": boolean;
    "thread_type": "Regular" | "RegularGroup" | "Pending" | "PendingGroup";
    "thread_path": string;
    "magic_words": any[];
    "messages": messageBase[];
}

interface jsonRegularGroup extends jsonBaseGroup {
    "image": {
        "uri": string;
        "creation_timestamp": EpochTimeStamp;
    };
}

interface jsonBaseGroup extends jsonBase {
    "joinable_mode": {
        "mode": number;
        "link": string;
    };
}

interface messageBase {
    "sender_name": string;
    "timestamp_ms": number;
    'type': 'Generic' | 'Share' | 'Call' | 'Subscribe';
    'is_unsent': false;
    'is_taken_down': boolean;
    'bumped_message_metadata': {
        "is_bumped": boolean;
        "bumped_message": string
    };
    'call_duration'?: number;
    'content'?: any;
    'share'?: {
        "link"?: string;
        "share_text"?: string;
        "original_content_owner"?: string;
      };
    'photos'?: any;
    'reactions'?: any;
    'call_duration'?: any;
    'videos'?: any;
    'audio_files'?: any;
    'users'?: any;
    
}