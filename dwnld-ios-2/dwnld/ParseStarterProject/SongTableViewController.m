//
//  SongTableViewController.m
//  ParseStarterProject
//
//  Created by Darshan Desai on 2/21/15.
//
//

#import "SongTableViewController.h"
#import <Parse/Parse.h>
#import "AFHTTPRequestOperationManager.h"
#import <MediaPlayer/MediaPlayer.h>
#import "LMMediaItem.h"

@interface SongTableViewController ()

@end

@implementation SongTableViewController

- (instancetype)init
{
	self = [super init];
	if (self){
		songs = [[NSMutableArray alloc] init];
	}
	return self;
}

- (id)initWithPlaylist:(MPMediaPlaylist *)playlist
{
    self = [self initWithStyle:UITableViewStylePlain];
    if (self) {
		
		NSLog(@"init song player");
    }
    
    return self;
}

- (void)dealloc
{
    playerView_.delegate = nil;
#if !__has_feature(objc_arc)
    [super dealloc];
    [musics_ release];
#endif
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
	
	NSLog(@"song table did appear");
	
    [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];
    [self becomeFirstResponder];
}


- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
	
	NSLog(@"song table will appear");
    playerView_.delegate = self;
    
    UIView *baseView = [[UIView alloc] initWithFrame:playerView_.frame];
    baseView.backgroundColor = [UIColor blackColor];
    [baseView addSubview:playerView_];
    self.tableView.tableHeaderView = baseView;
#if !__has_feature(objc_arc)
    [baseView release];
#endif
}
- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    
    [[UIApplication sharedApplication] endReceivingRemoteControlEvents];
    [self resignFirstResponder];
    
    playerView_.delegate = self;
}



#pragma mark - LMMediaPlayerViewDelegate

- (BOOL)mediaPlayerViewWillStartPlaying:(LMMediaPlayerView *)playerView media:(LMMediaItem *)media
{
    return YES;
}




- (void) downloadSong: (PFObject*) song path: (NSString*) partialPath{
    NSURL *url = [NSURL URLWithString:[song objectForKey:@"downloadURL"]];
    
    NSLog(@"URL %@", url);
    
    NSString *fullPath = [partialPath stringByAppendingString:[NSString stringWithFormat:@"/%@",[[song objectForKey:@"name"] stringByAppendingString:@".mp3"]]];
    
    NSLog(@"partial %@", partialPath);
    
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    
    AFHTTPRequestOperation *operation = [[AFHTTPRequestOperation alloc] initWithRequest:request];
    [operation setOutputStream:[NSOutputStream outputStreamToFileAtPath:fullPath append:NO]];
    
    
    [operation setDownloadProgressBlock:^(NSUInteger bytesRead, long long totalBytesRead, long long totalBytesExpectedToRead) {
        // ADD Progress Hud
        //NSLog(@"bytesRead: %u, totalBytesRead: %lld, totalBytesExpectedToRead: %lld", bytesRead, totalBytesRead, totalBytesExpectedToRead);
        
    }];
    
    [operation setCompletionBlockWithSuccess:^(AFHTTPRequestOperation *operation, id responseObject) {
        
        NSError *error;
        //NSDictionary *fileAttributes = [[NSFileManager defaultManager] attributesOfItemAtPath:fullPath error:&error];
        
        
        if (error) {
            //NSLog(@"ERR: %@", [error description]);
        } else {
            
            NSURL *fullPathURL = [NSURL URLWithString:[@"file://" stringByAppendingString:fullPath]];
            NSError * myError;
            NSData * data = [NSData dataWithContentsOfURL:fullPathURL options:NSDataReadingUncached error:&myError];
            
            NSLog(@"Err: %@", [myError description]);
            
            LMMediaItem *item = [[LMMediaItem alloc] initWithInfo:@{LMMediaItemInfoURLKey:fullPathURL, LMMediaItemInfoContentTypeKey:@(LMMediaItemContentTypeVideo)}];
            
            item.title = [song objectForKey:@"name"];
            item.artist = [song objectForKey:@"artist"];
            
            [musics_ addObject:item];
            
//            [playerView_.mediaPlayer addMedia:item];
            
            NSLog(@"success %@", fullPath);
            NSURL *path = [[NSBundle mainBundle] URLForResource:@"sample" withExtension:@"mp4"];

            NSLog(@"TEST %@", path);
            
            NSLog(@"--- ITEM: %@", item);
            
            [self.tableView reloadData];
            
        }
        
        
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        //NSLog(@"ERR: %@", [error description]);
    }];
    
    [operation start];
    
}
- (void) downloadSongs{
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0]; // Get documents folder
    NSString *dataPath = [documentsDirectory stringByAppendingPathComponent:@"Songs"];
    NSError *error;
    
    if (![[NSFileManager defaultManager] fileExistsAtPath:dataPath])
        [[NSFileManager defaultManager] createDirectoryAtPath:dataPath withIntermediateDirectories:NO attributes:nil error:&error]; //Create folder if it doesn't already exist
    
    for (int i = 0; i < songs.count; i++){
        PFObject *song = [songs objectAtIndex:i];
        [self downloadSong:song path:dataPath];
    }
    
}

- (void)viewDidLoad {
    [super viewDidLoad];
	
	NSLog(@"song table view did load");
    
    musics_ = [[NSMutableArray alloc] init];
    
    PFQuery *songQuery = [PFQuery queryWithClassName:@"Song"];
    songQuery.limit = 30;
    [songQuery orderByAscending:@"Order"];
    
    
    [songQuery findObjectsInBackgroundWithBlock:^(NSArray *songsLocal, NSError *error) {
        NSLog(@"no error %@", songsLocal);
		
		
        songs = [[NSMutableArray alloc] initWithArray:songsLocal];
        // YOUR CODE HERE CHARLIE
        [self downloadSongs];
        [self.tableView reloadData];
    }];
    
    
#if !__has_feature(objc_arc)
    [q release];
#endif
    
    playerView_ = [LMMediaPlayerView sharedPlayerView];
    playerView_.delegate = self;
    [playerView_ setBluredUserInterface:YES visualEffect:[UIBlurEffect effectWithStyle:UIBlurEffectStyleDark]];
    //	[playerView_ setBluredUserInterface:NO visualEffect:nil];
    
    
    /*
     
     
     
     
     playerView_ = [LMMediaPlayerView sharedPlayerView];
     playerView_.delegate = self;
     [playerView_ setBluredUserInterface:YES visualEffect:[UIBlurEffect effectWithStyle:UIBlurEffectStyleDark]];
     //	[playerView_ setBluredUserInterface:NO visualEffect:nil];
     
     
     //USE THIS CODE CHARLIE
     NSURL *path = [[NSBundle mainBundle] URLForResource:@"sample" withExtension:@"mp4"];
     LMMediaItem *item = [[LMMediaItem alloc] initWithInfo:@{LMMediaItemInfoURLKey:path, LMMediaItemInfoContentTypeKey:@(LMMediaItemContentTypeVideo)}];
     item.title = @"sample.mp4";
     [playerView_.mediaPlayer addMedia:item];
     
     
     // Uncomment the following line to preserve selection between presentations.
     // self.clearsSelectionOnViewWillAppear = NO;
     
     // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
     // self.navigationItem.rightBarButtonItem = self.editButtonItem;
     */
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    // Return the number of sections.
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    // Return the number of rows in the section.
    return [musics_ count];
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    
    // Configure the cell...
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:CellIdentifier];
        cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
#if !__has_feature(objc_arc)
        [cell autorelease];
#endif
    }
    
    if (indexPath.section == 0) {
        
        
        
        cell.textLabel.text = [(LMMediaItem *)musics_[indexPath.row] title];
        
        cell.textLabel.text = [(LMMediaItem *)musics_[indexPath.row] artist];
        
        
        //MPMediaItemArtwork *artwork = [musics_[indexPath.row] valueForProperty:MPMediaItemPropertyArtwork];
        //cell.imageView.image = [artwork imageWithSize:CGSizeMake(44, 44)];
    }
    
    
    return cell;
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section
{
<<<<<<< Updated upstream
    NSString *title = @"";
		
    if (section == 0)
=======
    NSString *title = nil;
    if (section == 0) {
>>>>>>> Stashed changes
        title = @"Songs";
    }
    
    
    return title;
}

#pragma mark - Table view delegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    
    NSLog(@"selected: %ldd.%ldd", (long)indexPath.section, (long)indexPath.row);
    
    LMMediaItem *item = [musics_ objectAtIndex:indexPath.row];
    
    NSLog(@"item: %@", item);
    
    NSURL *path = [[NSBundle mainBundle] URLForResource:@"sample" withExtension:@"mp4"];
    LMMediaItem *sample = [[LMMediaItem alloc] initWithInfo:@{LMMediaItemInfoURLKey:path, LMMediaItemInfoContentTypeKey:@(LMMediaItemContentTypeVideo)}];
    sample.title = @"sample.mp4";
    
    [playerView_.mediaPlayer playMedia:item];
    
#if !__has_feature(objc_arc)
    [item release];
#endif
    
    
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    
}

#pragma mark -
#pragma mark - remote control event
- (void)remoteControlReceivedWithEvent:(UIEvent *)receivedEvent
{
    if (receivedEvent.type == UIEventTypeRemoteControl) {
        switch (receivedEvent.subtype) {
            case UIEventSubtypeRemoteControlPlay:
            case UIEventSubtypeRemoteControlPause:
            case UIEventSubtypeRemoteControlTogglePlayPause: {
                if ([playerView_.mediaPlayer playbackState] == LMMediaPlaybackStatePlaying) {
                    [playerView_.mediaPlayer pause];
                }
                else if ([playerView_.mediaPlayer playbackState] == LMMediaPlaybackStatePaused || [playerView_.mediaPlayer playbackState] == LMMediaPlaybackStateStopped) {
                    [playerView_.mediaPlayer play];
                }
            } break;
            case UIEventSubtypeRemoteControlPreviousTrack: {
                [playerView_.mediaPlayer playPreviousMedia];
            } break;
            case UIEventSubtypeRemoteControlNextTrack: {
                [playerView_.mediaPlayer playNextMedia];
            } break;
            default:
                break;
        }
    }
}

- (BOOL)canBecomeFirstResponder
{
    return YES;
}

@end


/*
 
 
 - (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
 {
 static NSString *CellIdentifier = @"Cell";
 UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
 
 
 
 // Configure the cell...
 if (cell == nil) {
 cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:CellIdentifier];
 cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
 #if !__has_feature(objc_arc)
 [cell autorelease];
 #endif
 }
 
 if (indexPath.section == 0) {
 
 cell.textLabel.text = [(MPMediaItem *)songs[indexPath.row] valueForProperty:MPMediaItemPropertyTitle];
 cell.detailTextLabel.text = [(MPMediaItem *)songs[indexPath.row] valueForProperty:MPMediaItemPropertyArtist];
 MPMediaItemArtwork *artwork = [songs[indexPath.row] valueForProperty:MPMediaItemPropertyArtwork];
 cell.imageView.image = [artwork imageWithSize:CGSizeMake(44, 44)];
 
 }
 
 return cell;
 }
 
 - (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section
 {
 NSString *title = nil;
 if (section == 0)
 title = @"Songs";
 
 
 return title;
 }
 
 #pragma mark - Table view delegate
 
 - (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
 {
 
 NSURL *url = [songs[indexPath.row] valueForProperty:MPMediaItemPropertyAssetURL];
 if (url.absoluteString.length) {
 NSNumber *type = [songs[indexPath.row] valueForProperty:MPMediaItemPropertyMediaType];
 LMMediaItem *item = [[LMMediaItem alloc] initWithMetaMedia:songs[indexPath.row] contentType:([type integerValue] & MPMediaTypeMusicVideo) ? LMMediaItemContentTypeVideo : LMMediaItemContentTypeAudio];
 [playerView_.mediaPlayer addMedia:item];
 #if !__has_feature(objc_arc)
 [item release];
 #endif
 }
 else {
 
 }
 [tableView deselectRowAtIndexPath:indexPath animated:YES];
 
 
 
 }
 */
/*
 -(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
 
 }
 
 
 */




/*
 // Override to support conditional editing of the table view.
 - (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
 // Return NO if you do not want the specified item to be editable.
 return YES;
 }
 */

/*
 // Override to support editing the table view.
 - (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
 if (editingStyle == UITableViewCellEditingStyleDelete) {
 // Delete the row from the data source
 [tableView deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationFade];
 } else if (editingStyle == UITableViewCellEditingStyleInsert) {
 // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
 }
 }
 */

/*
 // Override to support rearranging the table view.
 - (void)tableView:(UITableView *)tableView moveRowAtIndexPath:(NSIndexPath *)fromIndexPath toIndexPath:(NSIndexPath *)toIndexPath {
 }
 */

/*
 // Override to support conditional rearranging of the table view.
 - (BOOL)tableView:(UITableView *)tableView canMoveRowAtIndexPath:(NSIndexPath *)indexPath {
 // Return NO if you do not want the item to be re-orderable.
 return YES;
 }
 */

/*
 #pragma mark - Navigation
 
 // In a storyboard-based application, you will often want to do a little preparation before navigation
 - (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
 // Get the new view controller using [segue destinationViewController].
 // Pass the selected object to the new view controller.
 }
 */

