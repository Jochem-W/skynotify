/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

var client *http.Client = &http.Client{Timeout: time.Second * 10}

type User struct {
	Did         string `json:"did"`
	DisplayName string `json:"displayName,omitempty"`
	Avatar      string `json:"avatar,omitempty"`
}

var users = struct {
	sync.RWMutex
	m map[string]User
}{m: make(map[string]User)}

func getOrFetchUser(did string) (User, error) {
	users.RLock()
	user := users.m[did]
	users.RUnlock()

	if user != (User{}) {
		return user, nil
	}

	response, err := client.Get(fmt.Sprintf("https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=%s", did))
	if err != nil {
		return user, err
	}

	user = User{}
	err = json.NewDecoder(response.Body).Decode(&user)
	if err != nil {
		return user, err
	}

	if user.Avatar != "" {
		slash := strings.LastIndex(user.Avatar, "/")
		if slash != -1 {
			at := strings.LastIndex(user.Avatar, "@")
			if at != -1 {
				user.Avatar = user.Avatar[slash+1 : at]
			}
		}
	}

	users.Lock()
	users.m[user.Did] = user
	users.Unlock()

	return user, nil
}