'use client';

import { MediaItem } from "@/types/media";
import StarRating from "../StarRating";
import QuickActions from "../QuickActions";
import './index.scss';
import Image from "next/image";
import React, { useState } from "react";
import { getPosterUrl } from "@/utils/tmdb";
import WatchLogModal from "../WatchLogModal";
import AddToListModal from "../AddToListModal";

export interface Props {
    mediaItem: MediaItem;
    mediaType: 'movie' | 'tv';
}

const MediaCard = React.forwardRef<HTMLLIElement, Props>(({
    mediaItem, mediaType
}, ref) => {
    const [isWatchLogModalOpen, setIsWatchLogModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const title = mediaType === 'movie' ? mediaItem.title : mediaItem.name;
    const linkHref = `/${mediaType}/${mediaItem.id}`;
    const posterUrl = getPosterUrl(mediaItem.poster_path ?? null);

    return (
        <>
            <li className="movie-card" ref={ref}>
                <div className="poster-container">
                   {posterUrl ? (
                     <Image 
                       src={posterUrl} 
                       alt={title || ''}
                       className="movie-poster" 
                       width={300} 
                       height={450}
                       unoptimized
                     />
                   ) : (
                     <div className="movie-poster-placeholder">
                       Sem Imagem
                     </div>
                   )}
                   <div className="card-actions-overlay">
                     <QuickActions
                       mediaId={mediaItem.id}
                       mediaType={mediaType}
                       mediaTitle={title || ''}
                       posterPath={mediaItem.poster_path}
                       onWatchClick={() => setIsWatchLogModalOpen(true)}
                       onListClick={() => setIsListModalOpen(true)}
                       detailsLink={linkHref}
                     />
                   </div>
                </div>

                <div className="movie-infos">
                    <p className="movie-title">
                        {title}
                    </p>
                    <StarRating 
                        rating={mediaItem.vote_average}
                    />
                </div>
            </li>

            <WatchLogModal
                isOpen={isWatchLogModalOpen}
                onClose={() => setIsWatchLogModalOpen(false)}
                mediaId={mediaItem.id}
                mediaType={mediaType}
                mediaTitle={title || ''}
                posterPath={mediaItem.poster_path}
            />

            <AddToListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                mediaId={mediaItem.id}
                mediaType={mediaType}
                mediaTitle={title || ''}
                posterPath={mediaItem.poster_path}
            />
        </>
    );
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;
