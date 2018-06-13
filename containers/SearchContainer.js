import React, { Component } from "react";
import TopPackContainer from "./TopPackContainer";
import axios from "axios";
import {
  Platform,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
  View
} from "react-native";
import _ from "lodash";
class SearchContainer extends Component {
  state = {
    inputText: "",
    repositories: [],
    loading: false,
    errorMessage: null
  };
  searchRepositories = async () => {
    if (this.state.inputText !== "") {
      this.setState({ loading: true });
      let apiResponse = await axios.get(
        `https://api.github.com/search/repositories?q=${
          this.state.inputText
        }&page=1&per_page=100`
      );
      if (apiResponse.data.items.length > 0) {
        let structuredData = [];
        apiResponse.data.items.map(item => {
          let dataObject = {
            name: item.name,
            id: item.id,
            stars: item.stargazers_count,
            forks: item.forks
          };
          structuredData.push(dataObject);
        });
        this.setState({
          loading: false,
          repositories: structuredData,
          errorMessage: null
        });
      } else {
        this.setState({ errorMessage: "No Repositories found." });
      }
    } else {
      this.setState({ errorMessage: "Enter a search string." });
    }
  };
  renderRepoItem = ({ item }) => {
    let dynamicStyle = {};
    let id = `${item.id}`;
    if (_.includes(this.props.allRepositories, id)) {
      dynamicStyle.backgroundColor = "#99ccff";
    }
    return (
      <View key={id} style={[styles.repoContainer, dynamicStyle]}>
        <View style={{ flex: 3 }}>
          <Text style={[styles.repoElements, { fontSize: 25 }]}>
            {item.name}
          </Text>
          <Text style={styles.repoElements}>Stars: {item.stars}</Text>
          <Text style={styles.repoElements}>Forks: {item.forks}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Button
            title="Import"
            onPress={() => {
              this.props.importRepo(id);
            }}
          />
        </View>
      </View>
    );
  };

  render() {
    let loading = null;
    if (this.state.loading) {
      loading = (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Image
            source={require("./img.gif")}
            style={{ height: 60, width: 60 }}
            resizeMode="contain"
          />
        </View>
      );
    } else {
      loading = null;
    }
    if (this.props.currentPage === 1) {
      return (
        <View style={styles.searchContainer}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 22 }}>Search</Text>
            <TextInput
              onChangeText={event => {
                this.setState({ inputText: event });
              }}
              style={{ fontSize: 19 }}
              placeholder="Search for Repositories Here"
            />
            <Button
              onPress={() => {
                this.searchRepositories();
              }}
              title="Search"
            />
          </View>
          {loading}
          <FlatList
            data={this.state.repositories}
            keyExtractor={item => `${item.id}`}
            extraData={this.props}
            renderItem={this.renderRepoItem}
          />
        </View>
      );
    } else if (this.props.topPacks.length > 0) {
      return <TopPackContainer topPacks={this.props.topPacks} />;
    } else {
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>No TopPacks yet.</Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  searchResult: {},
  searchButton: {
    margin: 20,
    width: 190,
    backgroundColor: "salmon",
    fontSize: 30
  },
  searchContainer: {
    flex: 14,
    padding: 2
  },
  repoContainer: {
    flexDirection: "row",
    margin: 0,
    borderBottomWidth: 0.8,
    padding: 3
  },
  repoElements: {
    padding: 5
  }
});
export default SearchContainer;
