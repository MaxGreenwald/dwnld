//
//  SongTableViewController.h
//  ParseStarterProject
//
//  Created by Darshan Desai on 2/21/15.
//
//

#import <UIKit/UIKit.h>
#import <ParseUI/ParseUI.h>
#import "LMMediaPlayerView.h"

@interface SongTableViewController : UITableViewController<LMMediaPlayerViewDelegate>{
    NSMutableArray *songs;
    LMMediaPlayerView *playerView_;
}


@end
