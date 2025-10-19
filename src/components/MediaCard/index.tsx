import { MediaItem } from "@/types/media";
import StarRating from "../StarRating";
import './index.scss';
import Link from "next/link";
import React from "react";

export interface Props {
    mediaItem: MediaItem;
    mediaType: 'movie' | 'tv';
}

const MediaCard = React.forwardRef<HTMLLIElement, Props>(({
    mediaItem, mediaType
}, ref) => {
    const title = mediaType === 'movie' ? mediaItem.title : mediaItem.name;
    const linkHref = `/${mediaType}/${mediaItem.id}`;

    return (
        <li className="movie-card" ref={ref}>
            <div>
               {mediaItem.poster_path ? (
                 <img src={`https://image.tmdb.org/t/p/w500${mediaItem.poster_path}`} alt={title || ''}
                  className="movie-poster" width={200} height={300} />
               ) : (
                 <div className="movie-poster-placeholder" style={{ width: 200, height: 300, backgroundColor: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                   No Image
                 </div>
               )}
            </div>

            <div className="movie-infos">
                <p className="movie-title">
                    {title}
                </p>
                <StarRating 
                    rating={mediaItem.vote_average}
                />

                <div className="hidden-content">
                    <Link href={linkHref} className="btn-default">Ver mais</Link>
                    <div className="additional-content">
                        <p className="description">
                            {mediaItem.overview}
                        </p>
                    </div>
                </div>
            </div>

            
        </li>
    );
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;
